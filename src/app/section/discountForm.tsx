"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const formSchema = z.object({
  discounts: z.array(
    z.object({
      quantity: z.number().min(2, "Quantity is required"),
      discount: z.number().min(5, "Discount is required"),
    })
  ),
});

type FormValues = z.infer<typeof formSchema>;

export default function DiscountForm() {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      discounts: [
        {
          quantity: 2,
          discount: 5,
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "discounts",
  });

  const onSubmit = (values: FormValues) => {
    console.log(values);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {fields.map((item, index) => (
        <div
          key={item.id}
          className="rounded-lg border p-4 space-y-4"
        >
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Minimum Quantity</Label>

              <Input
                type="number"
                placeholder="1"
                className="my-2"
                {...register(`discounts.${index}.quantity`,{valueAsNumber:true})}
              />

              {errors.discounts?.[index]?.quantity && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.discounts[index]?.quantity?.message}
                </p>
              )}
            </div>

            <div>
              <Label>Discount (%)</Label>

              <Input
                type="number"
                placeholder="10"
                className="my-2"
                {...register(`discounts.${index}.discount`,{valueAsNumber:true})}
              />

              {errors.discounts?.[index]?.discount && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.discounts[index]?.discount?.message}
                </p>
              )}
            </div>
          </div>

          <Button
            type="button"
            variant="destructive"
            className={'cursor-pointer'}
            onClick={() => remove(index)}
          >
            Remove
          </Button>
        </div>
      ))}

      <Button
        type="button"
        variant="outline"
        onClick={() =>
          append({
            quantity: 2,
            discount: 5,
          })
        }
      >
        + Add Discount
      </Button>

      <Button type="submit">
        Save Discounts
      </Button>
    </form>
  );
}