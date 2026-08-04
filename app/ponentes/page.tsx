import Navbar from '@/components/navbar/Navbar';
import SpeakersDirectory from '@/components/speakers/SpeakersDirectory'; 
import Footer from '@/components/footer/Footer';
import s from './SpeakersPage.module.css'; // Importamos los estilos de la atmósfera de fondo

export default function Home() {
  return (
    <>
      <Navbar />
      {/* El main ahora toma el control de la iluminación ambiental infinita */}
      <main className={s.pageWrapper}>
        <div className={s.contentContainer}>
          <SpeakersDirectory />
        </div>
      </main>
      <Footer />
    </>
  );
}