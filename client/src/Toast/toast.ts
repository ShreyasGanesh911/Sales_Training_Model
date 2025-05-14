import { Bounce, toast } from "react-toastify"

export const toastSuccess = (msg:string)=>{
    toast.success(msg,{
        position: "top-right",
    autoClose: 5000,
    hideProgressBar: true,
    closeOnClick: false,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    theme: "light",
transition: Bounce,
    })
}
export const toastError = (msg:string)=>{
    toast.error(msg,{
        position: "top-right",
    autoClose: 5000,
    hideProgressBar: true,
    closeOnClick: false,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    theme: "light",
    transition: Bounce,
    })
}