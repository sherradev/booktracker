import packageJson from "../../package.json";

export default function Footer(){
    return   (
    <footer className="mt-2 text-gray-500 flex">
      <span className="ml-auto mr-2">{packageJson && packageJson.version ? `v${packageJson.version}`:``}</span>
 
  </footer>);
}