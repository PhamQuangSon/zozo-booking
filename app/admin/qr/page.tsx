"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";

import { getRestaurants } from "@/actions/restaurant-actions";
import { getRestaurantTables } from "@/actions/table-actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

interface Restaurant {
  id: string;
  name: string;
}

interface Table {
  id: string;
  number: number;
}

type QRType = "table" | "restaurant";

export default function QRCodeGenerator() {
  const [restaurantId, setRestaurantId] = useState("");
  const [tableId, setTableId] = useState("");
  const [qrType, setQrType] = useState<QRType>("table");
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingTables, setIsLoadingTables] = useState(false);

  const { toast } = useToast();

  const showError = useCallback(
    (message: string) => {
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    },
    [toast]
  );

  useEffect(() => {
    let isCancelled = false;

    const fetchInitialData = async () => {
      try {
        if (!isCancelled) setIsLoading(true);
        const result = await getRestaurants();

        if (!isCancelled) {
          if (result.success) {
            const restaurantData = result.data.map((r) => ({
              id: r.id.toString(),
              name: r.name,
            }));
            setRestaurants(restaurantData);
          } else {
            showError(result.error || "Failed to load restaurants");
          }
        }
      } catch (error) {
        if (!isCancelled) {
          console.error("Error fetching restaurants:", error);
          showError("Failed to load restaurants");
        }
      } finally {
        if (!isCancelled) setIsLoading(false);
      }
    };

    fetchInitialData();

    return () => {
      isCancelled = true;
    };
  }, [showError]);

  useEffect(() => {
    let isCancelled = false;

    const fetchTables = async () => {
      if (!restaurantId) {
        if (!isCancelled) {
          setTables([]);
          setTableId(""); // Reset table selection
        }
        return;
      }

      try {
        if (!isCancelled) setIsLoadingTables(true);
        const { success, data, error } =
          await getRestaurantTables(restaurantId);

        if (!isCancelled) {
          if (success && data) {
            const tableData = data.map((t) => ({
              id: t.id.toString(),
              number: t.number,
            }));
            setTables(tableData);
          } else {
            showError(error || "Failed to fetch tables");
            setTables([]);
          }
          setTableId(""); // Reset table selection
        }
      } catch (error) {
        if (!isCancelled) {
          console.error("Error fetching tables:", error);
          showError("Failed to fetch tables");
          setTables([]);
        }
      } finally {
        if (!isCancelled) setIsLoadingTables(false);
      }
    };

    fetchTables();

    return () => {
      isCancelled = true;
    };
  }, [restaurantId, showError]);

  const generateTableQR = useCallback(() => {
    if (!restaurantId || !tableId) return "";

    const baseUrl = "https://v0-next-js-zozo-booking.vercel.app";
    const tableUrl = `${baseUrl}/restaurants/${restaurantId}/${tableId}`;
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(tableUrl)}`;
  }, [restaurantId, tableId]);

  const generateRestaurantQR = useCallback(() => {
    if (!restaurantId) return "";

    const baseUrl = "https://v0-next-js-zozo-booking.vercel.app";
    const restaurantUrl = `${baseUrl}/restaurant/${restaurantId}`;
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(restaurantUrl)}`;
  }, [restaurantId]);

  const handleRestaurantChange = useCallback((value: string) => {
    setRestaurantId(value);
    setQrCodeUrl(""); // Reset QR code when restaurant changes
  }, []);

  const handleQrTypeChange = useCallback((value: string) => {
    setQrType(value as QRType);
    setQrCodeUrl(""); // Reset QR code when type changes
  }, []);

  const generateQRCode = useCallback(() => {
    let newQrUrl = "";

    if (qrType === "table") {
      newQrUrl = generateTableQR();
    } else {
      newQrUrl = generateRestaurantQR();
    }

    setQrCodeUrl(newQrUrl);
  }, [qrType, generateTableQR, generateRestaurantQR]);

  const downloadQRCode = useCallback(() => {
    if (qrCodeUrl) {
      window.open(qrCodeUrl, "_blank");
    }
  }, [qrCodeUrl]);

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>QR Code Generator</CardTitle>
          <CardDescription>
            Generate QR codes for restaurant tables or general booking
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="table" onValueChange={handleQrTypeChange}>
            <TabsList className="mb-4">
              <TabsTrigger value="table">Table QR Code</TabsTrigger>
              <TabsTrigger value="restaurant">Restaurant QR Code</TabsTrigger>
            </TabsList>

            <TabsContent value="table" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="restaurant">Restaurant</Label>
                  <Select
                    value={restaurantId}
                    onValueChange={handleRestaurantChange}
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={
                          isLoading
                            ? "Loading restaurants..."
                            : "Select restaurant"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {restaurants.map((restaurant) => (
                        <SelectItem key={restaurant.id} value={restaurant.id}>
                          {restaurant.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="table-number">Table</Label>
                  <Select
                    value={tableId}
                    onValueChange={setTableId}
                    disabled={!restaurantId || isLoadingTables}
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={
                          !restaurantId
                            ? "Select a restaurant first"
                            : isLoadingTables
                              ? "Loading tables..."
                              : tables.length === 0
                                ? "No tables found"
                                : "Select table"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {tables.map((table) => (
                        <SelectItem key={table.id} value={table.id}>
                          Table {table.number}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button
                onClick={generateQRCode}
                disabled={!restaurantId || !tableId || isLoadingTables}
              >
                Generate QR Code
              </Button>
            </TabsContent>

            <TabsContent value="restaurant" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="restaurant">Restaurant</Label>
                <Select
                  value={restaurantId}
                  onValueChange={handleRestaurantChange}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        isLoading
                          ? "Loading restaurants..."
                          : "Select restaurant"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {restaurants.map((restaurant) => (
                      <SelectItem key={restaurant.id} value={restaurant.id}>
                        {restaurant.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={generateQRCode}
                disabled={!restaurantId || isLoading}
              >
                Generate QR Code
              </Button>
            </TabsContent>
          </Tabs>

          {qrCodeUrl && (
            <div className="mt-8 flex flex-col items-center">
              <div className="border p-4 rounded-lg mb-4 relative w-48 h-48">
                <Image
                  src={qrCodeUrl}
                  alt="QR Code"
                  fill
                  className="object-contain"
                  sizes="192px"
                />
              </div>
              <Button onClick={downloadQRCode}>Download QR Code</Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
