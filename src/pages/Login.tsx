import { Navigate, useSearchParams } from "react-router-dom";

import { AuthPageLayout } from "@/components/auth/AuthPageLayout";
import { LoginForm } from "@/components/auth/LoginForm";
import { useAuth } from "@/hooks/use-auth";
import { getSafeNextPath } from "@/lib/auth-paths";

const Login = () => {
  const { isAuthenticated } = useAuth();
  const [searchParams] = useSearchParams();
  const next = getSafeNextPath(searchParams.get("next"));

  if (isAuthenticated) return <Navigate to={next} replace />;

  return (
    <AuthPageLayout art="key" title="Добре дошли" description="Въведете данните си, за да влезете в профила." mode="login" next={next}>
      <LoginForm />
    </AuthPageLayout>
  );
};

export default Login;
