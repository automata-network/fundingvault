import { ReactNode } from "react";
import checkCircleIcon from "../../assets/imgs/check-circle.png";
import loadingIcon from "../../assets/imgs/loading.png";
import xCircleIcon from "../../assets/imgs/x-circle.png";

export const Alert = (props: {
  className?: string;
  type: "success" | "error" | "loading";
  title: string;
  message: ReactNode;
}): React.ReactElement => {
  const { className, type, title, message } = props;

  return (
    <div
      className={`ata-notification ${type}${className ? " " + className : ""}`}
    >
      <img
        className="ata-notification-icon"
        src={
          type === "error"
            ? xCircleIcon
            : type === "success"
            ? checkCircleIcon
            : loadingIcon
        }
        alt="error"
      />
      <div className="ata-notification-content">
        <div className="ata-notification-title">{title}</div>
        <div className="ata-notification-msg">{message}</div>
      </div>
    </div>
  );
};
