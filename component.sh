mkdir "components/$1";
echo ".$1 {

}" > "components/$1/$1.module.css";
echo "import styles from \"./$1.module.css\"
const $1 = () => {
  return(
    <div className={\`\${styles.$1}\`}>$1</div>
  )
}

export default $1" > "components/$1/$1.tsx";
echo "export { default } from \"./$1\"" > "components/$1/index.ts";