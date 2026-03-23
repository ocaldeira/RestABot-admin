import { IconProps } from "@/types/icon-props";

export function PreviewIcon(props: IconProps) {
  return (
    <svg
      width={20}
      height={20}
      viewBox="0 0 20 20"
      fill="currentColor"
      {...props}
    >
      <path d="M10 6.875a3.125 3.125 0 100 6.25 3.125 3.125 0 000-6.25zM8.123 10a1.875 1.875 0 113.75 0 1.875 1.875 0 01-3.75 0z" />
      <path d="M10 2.708c-3.762 0-6.296 2.254-7.767 4.164l-.026.035c-.333.432-.64.83-.847 1.3C1.137 8.71 1.04 9.26 1.04 10s.096 1.29.319 1.793c.208.47.514.868.847 1.3l.026.034c1.47 1.911 4.005 4.165 7.766 4.165 3.762 0 6.296-2.254 7.766-4.165l.027-.034c.333-.432.639-.83.847-1.3.222-.504.319-1.053.319-1.793s-.097-1.29-.32-1.793c-.207-.47-.513-.868-.846-1.3l-.027-.035c-1.47-1.91-4.004-4.164-7.766-4.164zM3.223 7.635C4.582 5.87 6.79 3.958 9.999 3.958s5.418 1.913 6.776 3.677c.366.475.58.758.72 1.077.132.298.213.662.213 1.288s-.081.99-.213 1.288c-.14.319-.355.602-.72 1.077-1.358 1.764-3.568 3.677-6.776 3.677-3.208 0-5.417-1.913-6.775-3.677-.366-.475-.58-.758-.72-1.077-.132-.298-.213-.662-.213-1.288s.08-.99.212-1.288c.141-.319.355-.602.72-1.077z" />
    </svg>
  );
}

export function DownloadIcon(props: IconProps) {
  return (
    <svg
      width={20}
      height={20}
      viewBox="0 0 20 20"
      fill="currentColor"
      {...props}
    >
      <path d="M10.461 13.755a.625.625 0 01-.922 0L6.205 10.11a.625.625 0 11.923-.843l2.247 2.457V2.5a.625.625 0 111.25 0v9.223l2.247-2.457a.625.625 0 01.923.843l-3.334 3.646z" />
      <path d="M3.125 12.5a.625.625 0 10-1.25 0v.046c0 1.14 0 2.058.097 2.78.101.75.317 1.382.818 1.884.502.501 1.133.717 1.884.818.722.097 1.64.097 2.78.097h5.092c1.14 0 2.058 0 2.78-.097.75-.101 1.382-.317 1.884-.818.501-.502.717-1.134.818-1.884.097-.722.097-1.64.097-2.78V12.5a.625.625 0 10-1.25 0c0 1.196-.001 2.03-.086 2.66-.082.611-.233.935-.463 1.166-.23.23-.555.38-1.166.463-.63.085-1.464.086-2.66.086h-5c-1.196 0-2.03-.001-2.66-.086-.611-.082-.935-.233-1.166-.463-.23-.23-.38-.555-.463-1.166-.085-.63-.086-1.464-.086-2.66z" />
    </svg>
  );
}

export function GlobeIcon(props: IconProps) {
  return (
    <svg
      width={20}
      height={20}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}

export function MailIcon(props: IconProps) {
  return (
    <svg
      width={20}
      height={20}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  );
}

export function TrashIcon(props: IconProps) {
  return (
    <svg
      width={20}
      height={20}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <line x1="10" y1="11" x2="10" y2="17" />
      <line x1="14" y1="11" x2="14" y2="17" />
    </svg>
  );
}

export function EyeIcon(props: IconProps) {
  return (
    <svg
      width={20}
      height={20}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

export function PlusIcon({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  );
}

export function SyncIcon({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
    </svg>
  );
}
