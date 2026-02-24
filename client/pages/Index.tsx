import { useState } from "react";
import { Header } from "@/components/Header";
import { PricingCard } from "@/components/PricingCard";
import { PaymentModal } from "@/components/PaymentModal";
import { Footer } from "@/components/Footer";

const pricingPlans = [
  {
    planName: "500MB 1HR,",
    price: 5,
    description: "1 Hrs Limited",
  },
  {
    planName: "UNLIMITED 1HR,",
    price: 10,
    description: "1 Hrs Unlimited",
  },
  {
    planName: "1GB DAILY,",
    price: 20,
    description: "1 Day Limited",
  },
  {
    planName: "2GB DAILY,",
    price: 30,
    description: "1 Day Limited",
  },
  {
    planName: "UNLIMITED 24HRS,",
    price: 35,
    description: "1 Days Unlimited",
  },
  {
    planName: "2GB WEEKLY,",
    price: 50,
    description: "7 Days Limited",
  },
  {
    planName: "5GB WEEKLY,",
    price: 100,
    description: "7 Days Limited",
  },
  {
    planName: "UNLIMITED 1WEEK,",
    price: 200,
    description: "7 Days Unlimited",
  },
  {
    planName: "30GB MONTHLY,",
    price: 450,
    description: "1 Months Limited",
  },
  {
    planName: "UNLIMITED 1MONTH,",
    price: 700,
    description: "1 Months Unlimited",
  },
];

export default function Index() {
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<{
    name: string;
    price: number;
  } | null>(null);

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

          {/* Pricing Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {pricingPlans.map((plan, index) => (
              <PricingCard
                key={index}
                planName={plan.planName}
                price={plan.price}
                description={plan.description}
                onConnect={handleConnect}
              />
            ))}
          </div>
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
