"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DiscountRule } from "../page";
import { toast } from "sonner";
import { useState } from "react";

const formSchema = z.object({
  discounts: z.array(
    z.object({
      quantity_min: z.number().min(2, "Minimum Quantity is required"),
      quantity_max: z.number().min(2, "Maximum Quantity is required"),
      amount: z.number().min(5, "Discount is required"),
      type:z.string({message:'type is required'})
    }).refine((val)=>val.quantity_min <= val.quantity_max ,{
      message:'minimum quantity must be less than or equal maximum quantity',
      path:["quantity_min"]
    })
  ).superRefine((discounts, ctx) => {
  for (let i = 1; i < discounts.length; i++) {
    const previousMax = discounts[i - 1].quantity_max;
   const prev = discounts[i - 1]
    const current = discounts[i];
    if (discounts[i].quantity_min < previousMax + 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: [i, "quantity_min"],
        message: `Minimum quantity must be at least ${previousMax + 1}.`,
      });
    }
if (current.amount >= prev.amount) {
  ctx.addIssue({
    code: z.ZodIssueCode.custom,
    path: [i, "amount"],
    message: `Discount must be less than ${prev.amount}.`,
  });
}
  }
}),
});

type FormValues = z.infer<typeof formSchema>;

export default function FixedDiscountForm({onChange , discountType}:{onChange:(value:DiscountRule[])=>void,discountType:string}) {
const [disableRule , setDisableRule] = useState(false)
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
          quantity_min: 2,
          quantity_max: 2,
          amount: 5,
          type:discountType
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "discounts",
  });

  const onSubmit = (values: FormValues) => {
    onChange(values.discounts);
    toast.success('your Rules saved successfully')
    setDisableRule(true)
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
                disabled={disableRule}
                aria-disabled={disableRule}
                {...register(`discounts.${index}.quantity_min`,{valueAsNumber:true})}
              />

              {errors.discounts?.[index]?.quantity_min && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.discounts[index]?.quantity_min?.message}
                </p>
              )}
            </div>
         
            <div>
              <Label>Maximum Quantity</Label>

              <Input
                type="number"
                placeholder="1"
                className="my-2"
                disabled={disableRule}
                aria-disabled={disableRule}
                {...register(`discounts.${index}.quantity_max`,{valueAsNumber:true})}
              />

              {errors.discounts?.[index]?.quantity_min && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.discounts[index]?.quantity_max?.message}
                </p>
              )}
            </div>
            <div>
              <Label>Discount Fixed Amount</Label>

              <Input
                type="number"
                placeholder="10"
                className="my-2"
                disabled={disableRule}
                aria-disabled={disableRule}
                {...register(`discounts.${index}.amount`,{valueAsNumber:true})}
              />

              {errors.discounts?.[index]?.amount && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.discounts[index]?.amount?.message}
                </p>
              )}
            </div>
          </div>

          <Button
            type="button"
            variant="destructive"
            className={'cursor-pointer'}
            disabled={disableRule}
            aria-disabled={disableRule}
            onClick={() => remove(index)}
          >
            Remove
          </Button>
        </div>
      ))}

      <Button
        type="button"
        variant="outline"
        className={'cursor-pointer'}
        disabled={disableRule}
        aria-disabled={disableRule}
        onClick={() =>
          append({
            quantity_min: 2,
            quantity_max: 2,
            amount: 5,
            type:discountType
          })
        }
      >
        + Add Discount
      </Button>

      <Button type="submit" disabled={disableRule} className={'cursor-pointer'}>
        Save Discounts
      </Button>
      <Button type="submit" disabled={!disableRule} onClick={()=>setDisableRule(!disableRule)} className={'cursor-pointer'}>
        Edit Discounts
      </Button>
    </form>
  );
}