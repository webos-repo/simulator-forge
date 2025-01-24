import { dialog } from 'electron';

type Message = {
  type: 'info' | 'warning' | 'error';
  message: string;
  detail: string;
};

class LogMessage extends Error implements Message {
  constructor(
    public type: Message['type'],
    public message: Message['message'],
    public detail: Message['detail']
  ) {
    super(detail);
  }

  showToUser = () =>
    dialog.showMessageBox({
      type: this.type,
      message: this.message,
      detail: this.detail,
    });
}

function showErrorBox(errorObj: any) {
  if (errorObj instanceof LogMessage) {
    errorObj.showToUser();
  } else {
    dialog.showMessageBox({
      type: 'error',
      message: errorObj?.name || 'Unknown error',
      detail: errorObj?.message,
    });
  }
}

export default LogMessage;
export { showErrorBox };
