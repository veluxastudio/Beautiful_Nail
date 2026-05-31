import { supabase } from "@/lib/supabase/client";

export async function getServices() {
  const { data, error } = await supabase
    .from("services")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

type ServiceValues = {
  name: string;
  description?: string;
  category?: string;
  price: number;
  duration: number;
  status?: string;
};

type ServiceUpdateValues = Partial<ServiceValues>;

export async function createService(values: ServiceValues) {
  const servicePayload = {
    ...values,
    category: values.category || "Nail",
    status: values.status || "Active",
  };

  const { data, error } = await supabase
    .from("services")
    .insert(servicePayload)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateService(id: string, values: ServiceUpdateValues) {
  const { data, error } = await supabase
    .from("services")
    .update(values)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteService(id: string) {
  const { error } = await supabase.from("services").delete().eq("id", id);
  if (error) throw error;
}