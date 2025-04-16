import { toast } from "react-toastify";
import GeneralToast from "../component/toast/generalToast";
import VersionToast from "../component/toast/versionToast";

interface GeneralToastProps {
  title: string;
  content?: string;
  linkUrl?: string;
}

interface VersionToastProps {
  currentVersion: string;
  latestVersion: string;
}

interface ToastParams {
  category: "general" | "version";
  props: GeneralToastProps | VersionToastProps;
}

function clearToast() {
  toast.dismiss();
}

function showToast({ category, props }: ToastParams) {
  if (category === "general") showGeneralToast(props as GeneralToastProps);
  else if (category === "version") showVersionToast(props as VersionToastProps);
}

function showVersionToast(props: VersionToastProps) {
  toast.info(VersionToast(props), {
    position: "top-right",
    progress: undefined,
    autoClose: 5000,
  });
}

function showGeneralToast(props: GeneralToastProps) {
  const { linkUrl } = props;
  toast.success(GeneralToast(props), {
    position: "top-right",
    progress: undefined,
    autoClose: 5000,
    ...(linkUrl
      ? {
          onClick: () => {
            window.shell.openExternal(linkUrl);
          },
        }
      : {}),
  });
}

export { clearToast, showToast };
export type { GeneralToastProps, VersionToastProps, ToastParams };
