import { Label } from "../ui/label"
import { useState } from "react";
import type { LucideIcon } from "lucide-react";

type FormFieldProps ={
  children: React.ReactNode,
  label: string,
  icon: LucideIcon
}
const FormField = ({icon:Icon, label, children}: FormFieldProps) => {
  const [show, setShow] = useState(false);

  return (
      <div>
        <Label size={'sm'} className="pb-2">{label}</Label>
        <div className="relative">
          <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/40" />
            {children}
        </div>

      </div>
  )
}

export default FormField
