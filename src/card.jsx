import React from "react";

// Generic Card Component
export function Card({ children, className }) {
  return <div className={`bg-white rounded-lg shadow-md ${className}`}>{children}</div>;
}

// Card Content Wrapper
export function CardContent({ children, className }) {
  return <div className={`p-4 ${className}`}>{children}</div>;
}

// Feature Card
export function FeatureCard({ icon: Icon, title, desc }) {
  return (
    <Card className="p-6 shadow-md">
      <CardContent className="flex flex-col items-start gap-4">
        <Icon className="text-blue-700 text-3xl" />
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-gray-600">{desc}</p>
      </CardContent>
    </Card>
  );
}

// Testimonial Card
export function ReviewSection({ name, role, text }) {
  return (
    <Card className="p-6 shadow-md flex flex-col justify-between min-h-[200px]">
      <CardContent className="text-left flex flex-col justify-between h-full">
        <p className="text-gray-600 flex-grow">{text}</p>
        <div className="mt-6">
          <h3 className="text-lg font-semibold">{name}</h3>
          <p className="text-gray-500 text-sm">{role}</p>
        </div>
      </CardContent>
    </Card>
  );
}


// Stat Card
export function StatsCard({ label, value }) {
  return (
    <Card className="p-4 text-center">
      <CardContent>
        <p className="text-xl font-bold text-blue-700">{value}</p>
        <p className="text-gray-600">{label}</p>
      </CardContent>
    </Card>
  );
}
