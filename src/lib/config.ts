const REQUIRED_ENV_VARS = [
  "GITHUB_CLIENT_ID",
  "GITHUB_CLIENT_SECRET",
  "NEXTAUTH_SECRET",
];

const OPTIONAL_ENV_VARS = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "NEXT_PUBLIC_SENTRY_DSN",
  "NEXT_PUBLIC_UMAMI_URL",
  "NEXT_PUBLIC_UMAMI_WEBSITE_ID",
  "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET",
];

export interface EnvValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  missing: string[];
}

export function validateEnvironment(): EnvValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const missing: string[] = [];

  for (const envVar of REQUIRED_ENV_VARS) {
    const value = process.env[envVar];
    
    if (!value) {
      missing.push(envVar);
      errors.push(`Missing required environment variable: ${envVar}`);
    } else if (value.includes("your_") || value.includes("xxx")) {
      warnings.push(`${envVar} appears to use placeholder value`);
    }
  }

  const secretEnv = process.env.NEXTAUTH_SECRET;
  if (secretEnv && secretEnv.length < 32) {
    warnings.push("NEXTAUTH_SECRET should be at least 32 characters");
  }

  const url = process.env.NEXTAUTH_URL;
  if (url && !url.startsWith("http://") && !url.startsWith("https://")) {
    errors.push("NEXTAUTH_URL must start with http:// or https://");
  }

  const publicUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (publicUrl && !publicUrl.startsWith("http")) {
    errors.push("NEXT_PUBLIC_SITE_URL must be a valid URL");
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    missing,
  };
}

export function logEnvironmentStatus(): void {
  const result = validateEnvironment();
  
  console.log("\n🔍 Environment Validation:");
  
  if (result.missing.length > 0) {
    console.log("\n❌ Missing required variables:");
    result.missing.forEach((v) => console.log(`   - ${v}`));
  }
  
  if (result.warnings.length > 0) {
    console.log("\n⚠️  Warnings:");
    result.warnings.forEach((w) => console.log(`   - ${w}`));
  }
  
  if (result.valid) {
    console.log("\n✅ Environment is valid!");
  } else {
    console.log("\n❌ Environment has errors!");
    console.log("Please check your .env.local file");
  }
  
  console.log("");
}

if (require.main === module) {
  logEnvironmentStatus();
}