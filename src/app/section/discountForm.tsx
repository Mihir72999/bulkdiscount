"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function DiscountForm() {
  const [inputs, setInputs] = useState([0]);

  const addInput = () => {
    setInputs((prev) => [...prev, prev.length]);
  };

  return (
    <div className="space-y-4">
      {inputs.map((_, index) => (
        <div
          key={index}
          className="flex items-center gap-4 rounded-lg border p-4"
        >
          <Input placeholder="Minimum Quantity" />
          <Input placeholder="Discount (%)" />
        </div>
      ))}

      <Button onClick={addInput}>
        + Add Discount
      </Button>
    </div>
  );
}