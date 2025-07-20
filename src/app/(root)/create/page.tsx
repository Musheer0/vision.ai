import UserBtn from "@/components/shared/user-button"
import { Button } from "@/components/ui/button"
import CreateVision from "@/components/visions/create-vision"
import { CrownIcon } from "lucide-react"
import Image from "next/image"

const page = () => {
  return <section
  className=" w-full flex-1 flex flex-col p-2 items-center justify-center"
  >
    <nav className="fixed top-0 z-50 left-0 w-full gap-2 flex items-center justify-between py-5 px-7">
     <div className="logo flex items-center gap-1">
      <Image
    width={40}
    height={140}
    src={'/logo.png'}
    alt="logo"
    className="z-10 relative"
    />
    <h2 className="font-semibold text-2xl">Vision.Ai</h2>
     </div>
     <Button className="ml-auto" size={'sm'}>Become a Pro <CrownIcon/></Button>
     <UserBtn/>
    </nav>
    <Image
    width={100}
    height={100}
    src={'/logo.png'}
    alt="logo"
    className="z-10 relative"
    />
    <h1 className="font-bold capitalize relative  pt-5 text-5xl sm:text-6xl z-10">
      Build your  vision</h1>
      <p className="opacity-50 relative z-10 pb-10">
        Create apps and websites by chatting with AI
      </p>
    <CreateVision/>
    <div
  style={{
    backgroundImage: 'url("bg-drop.svg")',
    backgroundSize: 'cover',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center top',

    backfaceVisibility: 'hidden',
    perspective: '1000px',
    willChange: 'transform',
  }}
  className="absolute left-1/2 top-0 blur-xl aspect-square w-[350%] -translate-x-1/2 overflow-hidden md:w-[190%] lg:w-[190%] xl:w-[190%] 2xl:mx-auto"
/>
<div
  style={{
    backgroundImage: 'url("grain.png")',
    backgroundSize: '100px 100px',
    backgroundRepeat: 'repeat',
    backgroundBlendMode: 'overlay',
    backgroundPosition: 'left top',
    mixBlendMode: 'overlay',
  }}
  className="absolute inset-0 pointer-events-none "
></div>

  </section>
}

export default page