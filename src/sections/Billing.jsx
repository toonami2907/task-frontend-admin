/* eslint-disable react/prop-types */
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  formatCardNumber,
  formatExpiryDate,
} from "@/functions/resources/aglorithm";
import React from "react";

const Billing = ({
  isEditingBilling,
  billingData,
  colors,
  setBillingData,
  userInfo,
  handleBillingSave,
  handleBillingCancel,
  handleBillingEdit,
}) => {
  return (
    <div>
      <section className="bg-white rounded-lg shadow-sm border border-[#E5E7EB]">
        <div className="p-6">
          <h2 className="text-2xl font-semibold text-[#111827]">
            Billing Information
          </h2>
          <p className="text-sm text-[#374151] mt-1">
            Update your payment method and billing details.
          </p>
        </div>
        <Separator className="bg-[#E5E7EB]" />
        <div className="p-6">
          {isEditingBilling ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label
                    htmlFor="card"
                    className={`${colors.primary.text} font-medium`}
                  >
                    Card Number
                  </Label>
                  <Input
                    id="card"
                    value={billingData.cardNumber}
                    onChange={(e) =>
                      setBillingData({
                        ...billingData,
                        cardNumber: formatCardNumber(e.target.value),
                      })
                    }
                    className={`bg-white ${colors.primary.ring}`}
                    placeholder="1234 5678 9012 3456"
                    maxLength="19"
                  />
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label
                      htmlFor="expiry"
                      className={`${colors.primary.text} font-medium`}
                    >
                      Expiry Date
                    </Label>
                    <Input
                      id="expiry"
                      value={billingData.expiry}
                      onChange={(e) =>
                        setBillingData({
                          ...billingData,
                          expiry: formatExpiryDate(e.target.value),
                        })
                      }
                      className={`bg-white ${colors.primary.ring}`}
                      placeholder="MM/YY"
                      maxLength="5"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="cvc"
                      className={`${colors.primary.text} font-medium`}
                    >
                      CVC
                    </Label>
                    <Input
                      id="cvc"
                      value={billingData.cvc}
                      onChange={(e) =>
                        setBillingData({
                          ...billingData,
                          cvc: e.target.value.replace(/\D/g, ""),
                        })
                      }
                      className={`bg-white ${colors.primary.ring}`}
                      placeholder="123"
                      maxLength="4"
                      type="password"
                    />
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleBillingSave}
                  className={colors.primary.bg}
                >
                  {userInfo?.billingInfo
                    ? "Save Changes"
                    : "Add Payment Method"}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleBillingCancel}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div>
              {userInfo?.billingInfo ? (
                <div className="space-y-6">
                  <div className="bg-[#F9FAFB] p-4 rounded-lg border border-[#E5E7EB]">
                    <p className="font-medium text-[#111827]">
                      Current Payment Method
                    </p>
                    <p className="text-sm text-[#374151] mt-1">
                      Card ending in{" "}
                      {userInfo.billingInfo.cardNumber.slice(-4)}
                    </p>
                    <p className="text-sm text-[#374151]">
                      Expires {userInfo.billingInfo.expiry}
                    </p>
                  </div>
                  <Button
                    onClick={handleBillingEdit}
                    className={colors.primary.bg}
                  >
                    Edit Billing Information
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 px-4 text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mb-2">
                    <svg
                      className="w-8 h-8 text-blue-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                      />
                    </svg>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-medium text-gray-900">
                      No Billing Information
                    </h3>
                    <p className="text-sm text-gray-500 max-w-sm">
                      You haven&rsquo;t added any billing information
                      yet. Add a payment method to manage your
                      subscription.
                    </p>
                  </div>
                  <Button
                    onClick={handleBillingEdit}
                    className={`${colors.primary.bg} mt-4`}
                  >
                    Add Payment Method
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Billing;
