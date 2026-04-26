import HeroScene from "@/components/canvas/HeroScene";
import ChatTerminal from "@/components/ChatTerminal";

export default function Home() {
  return (
    <>
      <div id="dom-root" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 10, pointerEvents: 'none' }}>
        <ChatTerminal />
      </div>
      <HeroScene />
    </>
  );
}
