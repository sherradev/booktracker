import packageJson from "../../package.json";

export default function Footer(){
    return   (
    <footer className="fixed bottom-0 left-0 w-full bg-gray-100 border-t border-gray-200 py-2 text-end pe-2 text-sm text-gray-500">
     {packageJson && packageJson.version ? `v${packageJson.version}`:``}
  </footer>);
}