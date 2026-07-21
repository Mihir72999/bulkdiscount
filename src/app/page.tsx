"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { ColorPalette } from "../../components/colorPalette";
import { useSaveWidgetSettings } from "../../lib/hooks";
import { cn } from "@/lib/utils";


export default function Home() {
  const [enabled, setEnabled] = useState(true);
  const [discountType, setDiscountType] = useState("percentage");
  const [backgroundColor, setBackgroundColor] = useState("#c364f4");
  const [borderRadius, setBorderRadius] = useState(10)
  const [checkedRadio, setCheckedRadio] = useState(false)
  const { saveWidgetSettings } = useSaveWidgetSettings();
  const color = [
   "#c364f4",
   "#800000",
   "#0018F9",
   "#FF9322",
   "#917CDB"
  ]
  async function handleSave(){
    try {
    
    await saveWidgetSettings({
      borderColor:backgroundColor,
      borderRadius,
    });
    toast.success('your settings saved successfully')
    
  } catch (err) {
    console.error(err);
    toast.error(`your settings saved successfully ${JSON.stringify(err)}`)
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

             <div className="flex items-center justify-between">
              <div className="space-y-2">
             <div className="flex justify-between">
             <span>Border Radius</span>
             <span>{borderRadius}px</span>
             </div>

  <Slider
    value={[borderRadius]}
    min={0}
    max={15}
    step={1}
    className={'border border-indigo-600'}
    onValueChange={(values) =>{
       const radius = Array.isArray(values) ? values[0] : values;
      setBorderRadius(radius)
    }}

      
   />
   </div>
            </div>
            </div>
          </div>

          <div className="flex gap-6">
          <Label>Color theme</Label>
         <ColorPalette colors={color} value={backgroundColor} onChange={setBackgroundColor} />
          </div>
          {/* Footer */}
          <div className="flex justify-end gap-3">
            <Button variant="outline">
              Cancel
            </Button>

            <Button className={'cursor-pointer'} 
             onClick={handleSave}
              >
              Save Offer
            </Button>
          </div>

        </CardContent>
      </Card>
       <div className="bc-discount-widget" onClick={() => setCheckedRadio((prev) => !prev)}>
  <label
    className={`relative mb-4 flex cursor-pointer items-center gap-5 rounded-[10px] border bg-white px-4 py-3 pl-8 transition-all hover:-translate-y-0.5 ${
      checkedRadio ? "border-violet-500" : "border-black"
    }`}
  >
    <input
      type="radio"
      name="discountQty"
      checked={checkedRadio}
      readOnly
      className={cn(`
        grid h-4 w-4 cursor-pointer place-content-center
        appearance-none rounded-full
        bg-violet-500
        focus:outline-2 focus:outline-offset-4 focus:outline-violet-500
        active:outline-2 active:outline-offset-4 active:outline-violet-500
      `,backgroundColor && `bg-[${backgroundColor}] active:outline-[${backgroundColor}] focus:outline-[${backgroundColor}]` )}
    />

    <div className="flex flex-col items-center px-5 max-sm:min-w-[75px]">
      <strong className="block text-[30px] font-bold text-black">
        2
      </strong>

      <small className="block text-xs font-bold text-gray-400">
        VIALS
      </small>
    </div>

    <div className="flex flex-col text-left font-bold uppercase tracking-[0.5px] text-gray-900">
      <span className="text-base">
        10% OFF
      </span>

      <small className="text-[13px] normal-case">
        $45.00 / VIAL
      </small>
    </div>

    <div className="ml-auto text-right font-bold text-gray-700">
      <span className="text-xl">
        $90.00
      </span>

      <small className="block text-base font-bold text-gray-400 line-through">
        $100.00
      </small>
    </div>
  </label>
</div>
    </div>
  );
}