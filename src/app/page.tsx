import HeroScene from "@/components/canvas/HeroScene";
import ChatTerminal from "@/components/ChatTerminal";

export default function Home() {
  return (
    <>
      <div id="page-root" style={{ 
        minHeight: '100vh', 
        width: '100%', 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        padding: '2rem 1rem',
        zIndex: 10, 
        pointerEvents: 'none' 
      }}>
        <ChatTerminal />
      </div>
      <HeroScene />
    </>
  );
}
