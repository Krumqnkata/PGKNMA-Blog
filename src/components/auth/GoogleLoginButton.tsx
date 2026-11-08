import { GoogleLogin, GoogleOAuthProvider, type GoogleLoginProps } from "@react-oauth/google";

/**
 * The provider loads Google's script when it mounts, so it lives next to the button rather than
 * around the whole app. The privacy policy promises Google is involved only when a visitor
 * chooses Google sign-in, so visiting a page must not contact Google.
 */
export function GoogleLoginButton(props: GoogleLoginProps) {
  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || ""}>
      {/* The width is fixed when Google draws the button, so a new width needs a new button. */}
      <GoogleLogin key={props.width} {...props} />
    </GoogleOAuthProvider>
  );
}
