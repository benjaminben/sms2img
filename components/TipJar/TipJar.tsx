import styles from "./TipJar.module.css"
import SquareCheckout from "../SquareCheckout"
const TipJar = () => {
  return(
    <>
      <div className={`${styles.TipJar}`}>TipJar</div>
      <SquareCheckout />
    </>
  )
}

export default TipJar
