"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { ColorPalette } from "../../components/colorPalette";
import { useSaveWidgetSettings } from "../../lib/hooks";

export default function Home() {
  const [enabled, setEnabled] = useState(true);
  const [discountType, setDiscountType] = useState("percentage");
  const [backgroundColor, setBackgroundColor] = useState("#c364f4");
  const [borderRadius , setBorderRadius] = useState(10)
  const { saveWidgetSettings } = useSaveWidgetSettings();
  const color = [
   "#c364f4",
   "#800000"
  ]
  const handleSave = async()=>{
    try {
    
    await saveWidgetSettings({
      borderColor:backgroundColor,
      borderRadius,
    });

    console.log("Settings saved");
  } catch (err) {
    console.error(err);
  } 
  }
  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Create Offer</CardTitle>
        </CardHeader>

        <CardContent className="space-y-8">

          {/* General */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">
              General
            </h3>

            <div className="space-y-2">
              <Label>Offer Name</Label>
              <Input placeholder="Summer Bundle" />
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea placeholder="Optional description..." />
            </div>

            <div className="flex items-center justify-between border rounded-lg p-4">
              <div>
                <Label>Enable Offer</Label>
                <p className="text-sm text-muted-foreground">
                  Customers can use this offer immediately.
                </p>
              </div>

              <Switch
                checked={enabled}
                onCheckedChange={setEnabled}
              />
            </div>
          </div>

          {/* Products */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">
              Products
            </h3>

            <Input
              placeholder="Search products..."
            />

            <div className="border rounded-lg p-4 text-sm text-muted-foreground">
              Product selector goes here...
            </div>
          </div>

          {/* Discount */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">
              Discount
            </h3>

            <RadioGroup
              value={discountType}
              onValueChange={setDiscountType}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem
                  value="percentage"
                  id="percentage"
                />
                <Label htmlFor="percentage">
                  Percentage
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <RadioGroupItem
                  value="fixed"
                  id="fixed"
                />
                <Label htmlFor="fixed">
                  Fixed Amount
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <RadioGroupItem
                  value="price"
                  id="price"
                />
                <Label htmlFor="price">
                  Fixed Price
                </Label>
              </div>
            </RadioGroup>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Minimum Quantity</Label>
                <Input
                  type="number"
                  defaultValue={2}
                />
              </div>

              <div className="space-y-2">
                <Label>Discount Value</Label>
                <Input
                  type="number"
                  placeholder="10" 
                />
              </div>
            </div>
          </div>

          {/* Appearance */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">
              Appearance
            </h3>

            <div className="grid grid-cols-3 gap-4">

              <div className="space-y-2">
                <Label>Widget Title</Label>
                <Input defaultValue="Bundle & Save" />
              </div>


              <div className="space-y-2">
                <Label>Border Radius</Label>
                <Input
                  type="number"
                  value={borderRadius}
                  min={0}
                  max={15}
                  onChange={(e)=>setBorderRadius(Number(e.target.value))}
                />
              </div>

            </div>
          </div>
          <div className="flex gap-3">
          <Label>Color theme</Label>
         <ColorPalette colors={color} value={backgroundColor} onChange={setBackgroundColor} />
          </div>
          {/* Footer */}
          <div className="flex justify-end gap-3">
            <Button variant="outline">
              Cancel
            </Button>

            <Button onClick={handleSave}>
              Save Offer
            </Button>
          </div>

        </CardContent>
      </Card>
    </div>
  );
}