import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { PricingCard } from "@/components/PricingCard";
import { PaymentModal } from "@/components/PaymentModal";
import { Footer } from "@/components/Footer";
import { Plan } from "@shared/api";

export default function Index() {
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<{
    name: string;
    price: number;
  } | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/plans", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.success && data.plans) {
          setPlans(data.plans);
        } else {
          setError(data.error || "Failed to load plans");
        }
      } catch (err) {
        console.error("Error fetching plans:", err);
        setError("Failed to load pricing plans. Please refresh the page.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlans();
  }, []);

  const handleConnect = (planName: string, price: number) => {
    setSelectedPlan({ name: planName, price });
    setIsPaymentOpen(true);
  };

  const handleClosePayment = () => {
    setIsPaymentOpen(false);
    setSelectedPlan(null);
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section */}
      <section className="bg-white py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground text-center mb-4">
            Ultra Fast,Cheap and Reliable WiFi.
          </h1>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="bg-white py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-4">CHECK OUR PRICING</h2>
          <p className="text-center text-gray-600 mb-12 text-lg">
            Choose a plan that fits your needs.
          </p>

          {/* Error State */}
          {error && (
            <div className="text-center mb-8 p-4 bg-red-50 text-red-600 rounded-lg">
              {error}
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="text-center py-12">
              <p className="text-gray-600">Loading plans...</p>
            </div>
          )}

          {/* Pricing Grid */}
          {!isLoading && !error && plans.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {plans.map((plan) => (
                <PricingCard
                  key={plan.id}
                  planName={plan.name}
                  price={plan.price}
                  description={plan.description}
                  onConnect={handleConnect}
                />
              ))}
            </div>
          )}

          {/* No Plans State */}
          {!isLoading && !error && plans.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-600">No plans available at the moment.</p>
            </div>
          )}
        </div>
      </section>

      {/* Payment Modal */}
      {selectedPlan && (
        <PaymentModal
          isOpen={isPaymentOpen}
          planName={selectedPlan.name}
          price={selectedPlan.price}
          onClose={handleClosePayment}
        />
      )}

      {/* Footer */}
      <Footer />
    </div>
  );
}
