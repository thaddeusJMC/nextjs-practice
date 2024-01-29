import { Invoice, LatestInvoice } from "@/app/lib/definitions"
import axios from "axios"
export default async function Page(){
  let content: Array<string>  = []
  await axios
    .get(`${process.env.FASTAPI_TEST_URL!}/customers`)
    .then((response) => {
      content = response.data.data.map((invoice: LatestInvoice) => invoice.name)
    })
    .catch((error) => {
      console.log(error)
    })
    .finally(() => {
      console.log("done")
    })
  
  return <div>{content.map((name) => 
  {
    return (<p>{name}</p>);
  })}
  </div>
}