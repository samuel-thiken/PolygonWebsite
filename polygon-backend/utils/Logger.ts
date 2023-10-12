import moment from "moment";

export default class Logger {

  public static log(message: string) {
    console.log(`[${moment().format("YYYY-MM-DD HH:MM:SS")}] - ${message}`);
  }

}
