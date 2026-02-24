interface PricingCardProps {
  planName: string;
  price: number;
  description: string;
  highlighted?: boolean;
}

export function PricingCard({
  planName,
  price,
  description,
  highlighted,
}: PricingCardProps) {
  return (
    <div className="flex flex-col h-full rounded-2xl overflow-hidden">
      {/* Light mint background section */}
      <div className="bg-muted flex-1 p-6 flex flex-col items-center justify-center">
        <div className="bg-primary text-primary-foreground rounded-full px-4 py-2 text-sm font-bold mb-6 text-center">
          {planName}
        </div>
        
        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-muted-foreground text-sm">ksh</span>
          <span className="text-4xl font-bold text-primary">{price}</span>
        </div>
        
        <p className="text-muted-foreground text-center text-sm">{description}</p>
      </div>

      {/* Green button section */}
      <div className="bg-secondary p-6 flex items-center justify-center">
        <button className="bg-white text-secondary font-semibold px-8 py-3 rounded-full hover:bg-gray-100 transition-colors">
          Click Here To Connect
        </button>
      </div>
    </div>
  );
}
