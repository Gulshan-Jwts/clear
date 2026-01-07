import Home from "@/pages/home.jsx";
import { useLenisScroll } from "./hooks/useLenisScroll.jsx";

function App() {
  useLenisScroll();
  return <Home />;
}

export default App;
