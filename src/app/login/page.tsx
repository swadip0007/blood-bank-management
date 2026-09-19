"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/components/AuthProvider";
import {
  Box,
  Paper,
  TextField,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Link as MuiLink,
  InputAdornment,
  IconButton,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";

export default function LoginPage() {
  const router = useRouter();
  const { user, profile, refreshProfile } = useAuth();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Automatically redirect if already logged in
  useEffect(() => {
    if (user) {
      const role =
        user.user_metadata?.role?.toLowerCase() ||
        profile?.role?.toLowerCase();
      if (role === "hospital" || role === "admin") {
        router.push("/hospital");
      } else {
        router.push("/donor");
      }
    }
  }, [user, profile, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const email = formData.email.trim().toLowerCase();
      const password = formData.password;

      if (!email || !password) {
        setError("Please enter both email and password.");
        setIsLoading(false);
        return;
      }

      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        const msg = authError.message.toLowerCase();
        if (msg.includes("invalid login credentials")) {
          throw new Error(
            "Invalid email or password. Please verify your credentials or register a new account."
          );
        }
        if (msg.includes("email not confirmed")) {
          throw new Error(
            "Your email has not been confirmed yet. Please check your inbox for the confirmation email, or disable email confirmation in your Supabase Dashboard (Authentication > Providers > Email)."
          );
        }
        throw authError;
      }

      const loggedInUser = data.user;
      if (!loggedInUser) throw new Error("No user found.");

      // Refresh profile in AuthProvider
      await refreshProfile(loggedInUser);

      // Determine role from user_metadata first
      let role = loggedInUser.user_metadata?.role?.toLowerCase();

      // If not in user_metadata, check profiles table
      if (!role) {
        const { data: profileData } = await supabase
          .from("profiles")
          .select("role")
          .or(`user_id.eq.${loggedInUser.id},id.eq.${loggedInUser.id}`)
          .maybeSingle();

        if (profileData?.role) {
          role = profileData.role.toLowerCase();
        }
      }

      // If still not found, check donor or hospital tables directly
      if (!role) {
        const { data: donor } = await supabase
          .from("donor")
          .select("id")
          .eq("user_id", loggedInUser.id)
          .maybeSingle();
        if (donor) role = "donor";
      }

      if (!role) {
        const { data: hospital } = await supabase
          .from("hospital")
          .select("id")
          .eq("user_id", loggedInUser.id)
          .maybeSingle();
        if (hospital) role = "hospital";
      }

      // Redirect appropriately
      if (role === "hospital" || role === "admin") {
        router.push("/hospital");
      } else {
        router.push("/donor");
      }

      router.refresh();
    } catch (err: any) {
      console.error("Login failed:", err);
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#f9fafb",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        px: 2,
      }}
    >
      <Paper
        elevation={2}
        sx={{
          width: "100%",
          maxWidth: 400,
          p: 4,
          borderRadius: 3,
          border: "1px solid #eee",
        }}
      >
        <Typography
          variant="h5"
          fontWeight={600}
          textAlign="center"
          color="text.primary"
          mb={0.5}
        >
          Sign in
        </Typography>

        <Typography
          variant="body2"
          textAlign="center"
          color="text.secondary"
          mb={3}
        >
          Welcome back to Blood Bank Management System
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Email"
            name="email"
            type="email"
            required
            autoComplete="email"
            value={formData.email}
            onChange={handleChange}
            margin="normal"
          />

          <TextField
            fullWidth
            label="Password"
            name="password"
            type={showPassword ? "text" : "password"}
            required
            autoComplete="current-password"
            value={formData.password}
            onChange={handleChange}
            margin="normal"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={isLoading}
            sx={{
              mt: 2,
              mb: 1,
              bgcolor: "error.main",
              "&:hover": { bgcolor: "error.dark" },
              py: 1.2,
              borderRadius: 2,
              textTransform: "none",
              fontSize: "1rem",
              fontWeight: 600,
            }}
          >
            {isLoading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              "Sign in"
            )}
          </Button>

          <Typography
            variant="body2"
            textAlign="center"
            color="text.secondary"
            sx={{ mt: 2 }}
          >
            Don’t have an account?{" "}
            <MuiLink
              component={Link}
              href="/register"
              color="error.main"
              underline="hover"
              fontWeight={600}
            >
              Create one
            </MuiLink>
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
}

