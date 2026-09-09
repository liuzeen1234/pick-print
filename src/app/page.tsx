import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <Container className="flex min-h-screen flex-col items-center justify-center gap-6 text-center">
      <h1 className="text-3xl font-bold sm:text-4xl">PickPrint</h1>
      <p className="max-w-md text-gray-500">
        挑一个模型，下单，我们帮你打印出来。浏览模型库、3D 预览、选材质与尺寸，
        剩下的交给我们远程打印并交付。
      </p>
      <div className="flex gap-3">
        <Link href="/models">
          <Button>浏览模型</Button>
        </Link>
        <Button variant="outline">了解更多</Button>
      </div>
    </Container>
  );
}
