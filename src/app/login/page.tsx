"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import {
  Box,
  Paper,
  TextField,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Link as MuiLink,
} from "@mui/material";

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
      });

      if (error) throw error;

      const user = data.user;
      if (!user) throw new Error("No user found");

      const role = user.user_metadata?.role?.toLocaleLowerCase();

      if (role === "donor") {
        router.push("/donor");
      } else if (role === "hospital") {
        router.push("/hospital");
      }
    } catch (err: any) {
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
            value={formData.email}
            onChange={handleChange}
            margin="normal"
          />

          <TextField
            fullWidth
            label="Password"
            name="password"
            type="password"
            required
            value={formData.password}
            onChange={handleChange}
            margin="normal"
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
            }}
          >
            {isLoading ? <CircularProgress size={24} color="inherit" /> : "Sign in"}
          </Button>

          <Typography
            variant="body2"
            textAlign="center"
            color="text.secondary"
            sx={{ mt: 1 }}
          >
            <MuiLink
              component={Link}
              href="/forgot-password"
              color="error.main"
              underline="hover"
            >
              Forgot password?
            </MuiLink>
          </Typography>

          <Typography
            variant="body2"
            textAlign="center"
            color="text.secondary"
            sx={{ mt: 1.5 }}
          >
            Don’t have an account?{" "}
            <MuiLink
              component={Link}
              href="/register"
              color="error.main"
              underline="hover"
            >
              Create one
            </MuiLink>
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
}
