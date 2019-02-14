import React from "react";
import PropTypes from "prop-types";
import { DatePickerAndroid, TimePickerAndroid, View, Text, NativeModules } from "react-native";
const { ClearableDatePicker, ClearableTimePicker } = NativeModules


export default class CustomDatePickerAndroid extends React.PureComponent {
  static propTypes = {
    date: PropTypes.instanceOf(Date),
    mode: PropTypes.oneOf(["date", "time", "datetime"]),
    onClear: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
    onConfirm: PropTypes.func.isRequired,
    onHideAfterConfirm: PropTypes.func,
    is24Hour: PropTypes.bool,
    isVisible: PropTypes.bool,
    datePickerModeAndroid: PropTypes.oneOf(["calendar", "spinner", "default"]),
    minimumDate: PropTypes.instanceOf(Date),
    maximumDate: PropTypes.instanceOf(Date)
  };

  static defaultProps = {
    date: new Date(),
    mode: "date",
    datePickerModeAndroid: "default",
    is24Hour: true,
    isVisible: false,
    onHideAfterConfirm: () => {}
  };

  componentDidUpdate = prevProps => {
    if (!prevProps.isVisible && this.props.isVisible) {
      if (this.props.mode === "date" || this.props.mode === "datetime") {
        this._showDatePickerAndroid();
      } else {
        this._showTimePickerAndroid();
      }
    }
  };

  componentDidMount = () => {
    if (this.props && this.props.isVisible) {
      if (this.props.mode === "date" || this.props.mode === "datetime") {
        this._showDatePickerAndroid();
      } else {
        this._showTimePickerAndroid();
      }
    }
  };
  
  _showDatePickerAndroid = () => {
    try {
       ClearableDatePicker.open({
        date: new Date(this.props.date).getTime(),
        mode: this.props.datePickerModeAndroid
      }).then(({ action, year, month, day }) => {
        if (action === "dateSetAction") {
          let date;
          if (this.props.date && !isNaN(this.props.date.getTime())) {
            let hour = this.props.date.getHours();
            let minute = this.props.date.getMinutes();
            date = new Date(year, month, day, hour, minute);
          } else {
            date = new Date(year, month, day);
          }

          if (this.props.mode === "datetime") {
            const timeOptions = {
              is24Hour: this.props.is24Hour,
              mode: this.props.datePickerModeAndroid
            };
            if (this.props.date) {
              timeOptions.hour = this.props.date.getHours();
              timeOptions.minute = this.props.date.getMinutes();
            }
            TimePickerAndroid.open(timeOptions).then(({action:timeAction, hour,minute}) =>{
              if (timeAction !== TimePickerAndroid.dismissedAction) {
                const selectedDate = new Date(year, month, day, hour, minute);
                this._setDate(selectedDate)
              } else {
                this._cancelDate()
              }
            })
            
          } else {
            this._setDate(date)
          }
        } else if(action === 'clearedAction') {
          this._clearDate()
        }
        else{
          this._cancelDate()
        }
      })
    } catch ({ code, message }) {
      console.warn("Cannot open date picker", message);
    }
  };

  _showTimePickerAndroid = async () => {
    try {
      ClearableTimePicker.open({
        hourOfDay: this.props.date.getHours(),
        minute: this.props.date.getMinutes(),
        is24HourView: this.props.is24Hour,
        mode: this.props.datePickerModeAndroid
      }).then(({action, hourOfDay:hour, minute})=>{
        if (action === "timeSetAction") {
          let date;
          if (this.props.date) {
            const year = this.props.date.getFullYear();
            const month = this.props.date.getMonth();
            const day = this.props.date.getDate();
            date = new Date(year, month, day, hour, minute);
          } else {
            date = new Date().setHours(hour).setMinutes(minute);
          }
          this._setDate(date)
        } else if(action ==="clearedAction"){
          this._clearDate()
        } else {
          this._cancelDate()
        }
      })
    } catch ({ code, message }) {
      console.warn("Cannot open time picker", message);
    }
  };

  _setDate = (date ) => {
    this.props.onConfirm(date);
    this.props.onHideAfterConfirm(date);
  }

  _clearDate = () =>{
    this.props.onClear();
    this.props.onHideAfterConfirm();
  }

  _cancelDate = () =>{
    this.props.onCancel();
  }

  render() {
    return null;
  }
}
