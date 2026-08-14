import { Globe, Laptop, Monitor, Smartphone, Tablet } from "lucide-react";
import type { ComponentProps } from "react";

import type { Device } from "@/lib/visitorInfo/browserInfo";

type IconProps = ComponentProps<typeof Monitor>;

export function DeviceIcon({
  device,
  ...props
}: { device: Device } & IconProps) {
  switch (device) {
    case "mobile":
      return <Smartphone {...props} />;
    case "tablet":
      return <Tablet {...props} />;
    case "laptop":
      return <Laptop {...props} />;
    case "desktop":
      return <Monitor {...props} />;
    default:
      return <Globe {...props} />;
  }
}
