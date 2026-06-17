import type { Metadata } from "next";
import {
  listServiceOrders,
  listCustomersBrief,
} from "@/lib/db/service-orders";
import { isAiEnabled } from "@/lib/ai/laudo";
import { OrdersManager } from "@/components/ordens/orders-manager";

export const metadata: Metadata = {
  title: "Ordens de Serviço · E-Tech Cloud",
};

export default async function OrdensPage() {
  const [orders, customers] = await Promise.all([
    listServiceOrders(),
    listCustomersBrief(),
  ]);

  return (
    <main className="flex flex-col gap-6 px-8 py-10">
      <OrdersManager
        orders={orders}
        customers={customers}
        aiEnabled={isAiEnabled()}
      />
    </main>
  );
}
