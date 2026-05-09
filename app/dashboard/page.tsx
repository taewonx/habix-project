import Link from 'next/link';

/** 로그인/회원가입 후 넘어오는 진입 페이지 (추후 트레이너·회원 대시보드로 분리 가능) */
export default function DashboardPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-muted/40">
      <div className="bg-white rounded-lg shadow p-8 max-w-md w-full text-center space-y-4">
        <h1 className="text-2xl font-bold">대시보드</h1>
        <p className="text-muted-foreground text-sm">
          로그인에 성공했습니다. 앱 기능은 여기에 연결하면 됩니다.
        </p>
        <Link
          href="/"
          className="inline-block text-primary font-medium hover:underline text-sm"
        >
          홈으로
        </Link>
      </div>
    </div>
  );
}
