import { useState } from "react";
import { X, Loader2, Copy, Check } from "lucide-react";

interface WiFiCredentials {
  username: string;
  password: string;
  ssid: string;
  expiresIn: string;
}

interface PaymentModalProps {
  isOpen: boolean;
  planName: string;
  price: number;
  onClose: () => void;
}

export function PaymentModal({
  isOpen,
  planName,
  price,
  onClose,
}: PaymentModalProps) {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [credentials, setCredentials] = useState<WiFiCredentials | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/payment/initiate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phoneNumber,
          amount: price,
          planName,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Payment initiation failed");
      }

      // Set credentials if available
      if (data.credentials) {
        setCredentials(data.credentials);
      }
      setSuccess(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An error occurred"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleClose = () => {
    onClose();
    setSuccess(false);
    setPhoneNumber("");
    setCredentials(null);
    setError("");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-foreground">Complete Payment</h2>
          <button
            onClick={onClose}
            disabled={loading}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {success && credentials ? (
          <div className="text-center py-6">
            <div className="bg-secondary text-secondary-foreground rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <p className="text-lg font-semibold text-foreground mb-4">
              Payment Successful!
            </p>
            <p className="text-sm text-gray-600 mb-6">
              Your WiFi credentials are ready to use
            </p>

            {/* WiFi Credentials Display */}
            <div className="bg-muted p-4 rounded-lg space-y-4 text-left">
              {/* SSID */}
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase">
                  Network Name (SSID)
                </label>
                <div className="flex items-center justify-between bg-white p-3 rounded mt-1">
                  <span className="font-mono text-foreground">
                    {credentials.ssid}
                  </span>
                  <button
                    onClick={() =>
                      handleCopy(credentials.ssid, "ssid")
                    }
                    className="text-primary hover:text-primary/80"
                  >
                    {copiedField === "ssid" ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Username */}
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase">
                  Username
                </label>
                <div className="flex items-center justify-between bg-white p-3 rounded mt-1">
                  <span className="font-mono text-foreground">
                    {credentials.username}
                  </span>
                  <button
                    onClick={() =>
                      handleCopy(credentials.username, "username")
                    }
                    className="text-primary hover:text-primary/80"
                  >
                    {copiedField === "username" ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase">
                  Password
                </label>
                <div className="flex items-center justify-between bg-white p-3 rounded mt-1">
                  <span className="font-mono text-foreground">
                    {credentials.password}
                  </span>
                  <button
                    onClick={() =>
                      handleCopy(credentials.password, "password")
                    }
                    className="text-primary hover:text-primary/80"
                  >
                    {copiedField === "password" ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Expiry */}
              <div className="bg-yellow-50 border border-yellow-200 p-3 rounded">
                <p className="text-xs font-semibold text-yellow-800">
                  ⏱️ Valid for: {credentials.expiresIn}
                </p>
              </div>
            </div>

            <p className="text-xs text-gray-500 mt-6">
              A confirmation will be sent to your phone
            </p>

            <button
              onClick={handleClose}
              className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground font-semibold py-2 rounded-lg mt-6 transition-colors"
            >
              Done
            </button>
          </div>
        ) : success ? (
          <div className="text-center py-8">
            <div className="bg-secondary text-secondary-foreground rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <p className="text-lg font-semibold text-foreground">
              Payment initiated successfully!
            </p>
            <p className="text-sm text-gray-600 mt-2">
              Please check your phone for the Mpesa prompt.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {/* Plan Details */}
            <div className="bg-muted p-4 rounded-lg mb-6">
              <p className="text-sm text-muted-foreground mb-1">Plan</p>
              <p className="font-semibold text-foreground">{planName}</p>
              <p className="text-2xl font-bold text-primary mt-2">
                Ksh {price}
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}

            {/* Phone Number Input */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-foreground mb-2">
                Phone Number (254...)
              </label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="e.g., 254769599129"
                disabled={loading}
                required
                className="w-full px-4 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground placeholder:text-gray-400"
              />
              <p className="text-xs text-gray-500 mt-1">
                Include country code (254 for Kenya)
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !phoneNumber}
              className="w-full bg-secondary hover:bg-secondary/90 disabled:bg-gray-400 text-secondary-foreground font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Pay with Mpesa"
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
