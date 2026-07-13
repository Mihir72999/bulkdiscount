'use client'
import { ChangeEvent, FormEvent, useState } from 'react';
import { FormData, StringKeyValue } from '../types';

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
  <div className="bg-white border border-gray-200 rounded-lg p-6">
    <h2 className="text-lg font-semibold mb-6">
      Basic Information
    </h2>

    {/* Product Name */}
    <div className="mb-4">
      <label className="block text-sm font-medium mb-2">
        Product name *
      </label>

      <input
        type="text"
        name="name"
        value={form.name}
        onChange={handleChange}
        className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      {errors?.name && (
        <p className="text-red-500 text-sm mt-1">
          {errors.name}
        </p>
      )}
    </div>

    {/* Product Type */}
    <div className="mb-4">
      <label className="block text-sm font-medium mb-2">
        Product type *
      </label>

      <select
        name="type"
        value={form.type}
        onChange={(e) => handleSelectChange(e.target.value)}
        className="w-full rounded-md border border-gray-300 px-3 py-2"
      >
        <option value="physical">Physical</option>
        <option value="digital">Digital</option>
      </select>
    </div>

    {/* Price */}
    <div className="mb-4">
      <label className="block text-sm font-medium mb-2">
        Default price (excluding tax) *
      </label>

      <div className="relative">
        <span className="absolute left-3 top-2.5 text-gray-500">$</span>

        <input
          type="number"
          step="0.01"
          name="price"
          placeholder="10.00"
          value={form.price}
          onChange={handleChange}
          className="w-full rounded-md border border-gray-300 pl-8 pr-3 py-2"
        />
      </div>

      {errors?.price && (
        <p className="text-red-500 text-sm mt-1">
          {errors.price}
        </p>
      )}
    </div>

    {/* Inventory */}
    <div className="mb-4">
      <label className="block text-sm font-medium mb-2">
        Quantity in inventory *
      </label>

      <input
        type="number"
        step="1"
        name="inventory_level"
        placeholder="0"
        value={form.inventory_level}
        onChange={handleChangeinventory_level}
        className="w-full rounded-md border border-gray-300 px-3 py-2"
      />

      {errors?.inventory_level && (
        <p className="text-red-500 text-sm mt-1">
          {errors.inventory_level}
        </p>
      )}
    </div>

    {/* Visible */}
    <div className="flex items-center gap-2">
      <input
        type="checkbox"
        name="is_visible"
        checked={form.is_visible}
        onChange={handleCheckboxChange}
        className="h-4 w-4"
      />

      <label>
        Visible on storefront
      </label>
    </div>
  </div>

  {/* Description */}
  <div className="bg-white border border-gray-200 rounded-lg p-6">
    <h2 className="text-lg font-semibold mb-6">
      Description
    </h2>

    <textarea
      name="description"
      placeholder="Product info"
      value={form.description}
      onChange={handleChange}
      rows={6}
      className="w-full rounded-md border border-gray-300 px-3 py-2"
    />
  </div>

  {/* Actions */}
  <div className="flex justify-end gap-4">
    <button
      type="button"
      onClick={onCancel}
      className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
    >
      Cancel
    </button>

    <button
      type="submit"
      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
    >
      Save
    </button>
  </div>

</form>
    );
};

export default Form;
