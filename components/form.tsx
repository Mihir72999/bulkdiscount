'use client'
import { ChangeEvent, FormEvent, useState } from 'react';
import { FormData, StringKeyValue } from '../types';
import { Button } from "@/components/ui/button";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Input } from "@/components/ui/input";

import { Label } from "@/components/ui/label";

import { Textarea } from "@/components/ui/textarea";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Switch } from "@/components/ui/switch";
interface FormProps {
    formData: FormData;
    onCancel(): void;
    onSubmit(form: FormData): void;
}

const FormErrors:Record<string,string> = {
    name: 'Product name is required',
    price: 'Default price is required',
    inventory_level: 'Quantity in inventory_level is required',
};

const Form = ({ formData, onCancel, onSubmit }: FormProps) => {
    const { description, is_visible, name, price, inventory_level, type } = formData;
    const [form, setForm] = useState<FormData>({ description, is_visible, name, price , inventory_level, type });
    const [errors, setErrors] = useState<StringKeyValue>({});

    const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name: formName, value } = event.target || {};
        setForm(prevForm => ({ ...prevForm, [formName]: value }));

        // Add error if it exists in FormErrors and the input is empty, otherwise remove from errors
        !value && FormErrors[formName]
            ? setErrors(prevErrors => ({ ...prevErrors, [formName]: FormErrors[formName] }))
            : setErrors(({ [formName]: removed, ...prevErrors }) => ({ ...prevErrors }));
    };

    const handleChangeinventory_level = (event: ChangeEvent<HTMLInputElement>) => {
        const { name: formName, value } = event.target || {};
        const numericValue = Number(value);
        setForm(prevForm => ({ ...prevForm, [formName]: numericValue }));
    };

    const handleSelectChange = (value: string) => {
        setForm(prevForm => ({ ...prevForm, type: value }));
    };

    const handleCheckboxChange = (event: ChangeEvent<HTMLInputElement>) => {
        const { checked, name: formName } = event.target || {};
        setForm(prevForm => ({ ...prevForm, [formName]: checked }));
    };

    const handleSubmit = (event: FormEvent<EventTarget>) => {
        event.preventDefault();

        // If there are errors, do not submit the form
        const hasErrors = Object.keys(errors).length > 0;
        if (hasErrors) return;

        onSubmit(form);
    };

    return (
  <form onSubmit={handleSubmit} className="space-y-6">

    {/* Basic Information */}
    <Card>
      <CardHeader>
        <CardTitle>Basic Information</CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">

        {/* Product Name */}
        <div className="space-y-2">
          <Label htmlFor="name">
            Product Name *
          </Label>

          <Input
            id="name"
            name="name"
            value={form.name}
            onChange={handleChange}
          />

          {errors.name && (
            <p className="text-sm text-destructive">
              {errors.name}
            </p>
          )}
        </div>

        {/* Product Type */}
        <div className="space-y-2">
          <Label>
            Product Type
          </Label>

          <Select
            value={form.type}
            onValueChange={handleSelectChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select product type" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="physical">
                Physical
              </SelectItem>

              <SelectItem value="digital">
                Digital
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Price */}
        <div className="space-y-2">
          <Label htmlFor="price">
            Default Price (excluding tax) *
          </Label>

          <Input
            id="price"
            type="number"
            step="0.01"
            name="price"
            value={form.price}
            placeholder="10.00"
            onChange={handleChange}
          />

          {errors.price && (
            <p className="text-sm text-destructive">
              {errors.price}
            </p>
          )}
        </div>

        {/* Inventory */}
        <div className="space-y-2">
          <Label htmlFor="inventory_level">
            Quantity in Inventory *
          </Label>

          <Input
            id="inventory_level"
            type="number"
            step="1"
            name="inventory_level"
            value={form.inventory_level}
            placeholder="0"
            onChange={handleChangeinventory_level}
          />

          {errors.inventory_level && (
            <p className="text-sm text-destructive">
              {errors.inventory_level}
            </p>
          )}
        </div>

        {/* Visible */}
        <div className="flex items-center justify-between rounded-lg border p-4">
          <div className="space-y-1">
            <Label>
              Visible on Storefront
            </Label>

            <p className="text-sm text-muted-foreground">
              Show this product on your storefront.
            </p>
          </div>

          <Switch
            checked={form.is_visible}
            onCheckedChange={(checked:boolean) =>
              setForm(prev => ({
                ...prev,
                is_visible: checked,
              }))
            }
          />
        </div>

      </CardContent>
    </Card>

    {/* Description */}
    <Card>
      <CardHeader>
        <CardTitle>Description</CardTitle>
      </CardHeader>

      <CardContent>
        <Textarea
          name="description"
          value={form.description}
          placeholder="Product information"
          rows={6}
          onChange={handleChange}
        />
      </CardContent>
    </Card>

    {/* Actions */}
    <div className="flex justify-end gap-4">
      <Button
        type="button"
        variant="outline"
        onClick={onCancel}
      >
        Cancel
      </Button>

      <Button type="submit">
        Save Changes
      </Button>
    </div>

  </form>
);
};

export default Form;
