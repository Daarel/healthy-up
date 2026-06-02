import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";


export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function maskEmail(email, visibleCount = 3) {
    const [username, domain] = email.split("@");

    if (username.length <= visibleCount) {
     
        return username.charAt(0) + "...@" + domain;
    }    
    const visiblePart = username.substring(0, visibleCount);
    

    const maskedPart = "*".repeat(username.length - visibleCount);

    return visiblePart + maskedPart + "@" + domain;
}