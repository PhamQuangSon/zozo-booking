"use client";

import { format, startOfDay } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useState, useTransition } from "react";
import type React from "react";

import { createReservation } from "@/actions/reservation-actions";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";

type BookingFormProps = {
  restaurants: { id: number; name: string }[];
  defaultRestaurantId?: string;
};

// Combines the picked day with "HH:mm" in the customer's local timezone.
function combineDateAndTime(date: Date, time: string): Date {
  const [hours, minutes] = time.split(":").map(Number);
  const result = new Date(date);
  result.setHours(hours, minutes, 0, 0);
  return result;
}

export function BookingForm({ restaurants, defaultRestaurantId }: BookingFormProps) {
  const [restaurantId, setRestaurantId] = useState(
    restaurants.some((r) => String(r.id) === defaultRestaurantId)
      ? (defaultRestaurantId as string)
      : restaurants.length === 1
        ? String(restaurants[0].id)
        : "",
  );
  const [date, setDate] = useState<Date>();
  const [time, setTime] = useState("");
  const [guests, setGuests] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!restaurantId || !date || !time || !guests || !name || !phone) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const reservedAt = combineDateAndTime(date, time);

    startTransition(async () => {
      const result = await createReservation({
        restaurantId: Number(restaurantId),
        reservedAt,
        guests: Number(guests),
        customerName: name,
        customerEmail: email,
        customerPhone: phone,
      });

      if (!result.success) {
        const fieldMessage = result.fieldErrors
          ? Object.values(result.fieldErrors).flat().filter(Boolean)[0]
          : undefined;
        toast({
          title: "Reservation failed",
          description: fieldMessage ?? result.error,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Reservation confirmed",
        description: `Table ${result.data.tableNumber} is reserved for ${result.data.guests} guests on ${format(new Date(result.data.reservedAt), "PPP p")}.`,
      });
      setDate(undefined);
      setTime("");
      setGuests("");
    });
  };

  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Make a Reservation</CardTitle>
          <CardDescription>Book a table at our restaurant</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="restaurant">Restaurant</Label>
                <Select value={restaurantId} onValueChange={setRestaurantId}>
                  <SelectTrigger id="restaurant">
                    <SelectValue placeholder="Select restaurant" />
                  </SelectTrigger>
                  <SelectContent>
                    {restaurants.map((restaurant) => (
                      <SelectItem key={restaurant.id} value={String(restaurant.id)}>
                        {restaurant.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !date && "text-muted-foreground",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP") : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      disabled={(day) => day < startOfDay(new Date())}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="time">Time</Label>
                <Select value={time} onValueChange={setTime}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select time" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="12:00">12:00 PM</SelectItem>
                    <SelectItem value="12:30">12:30 PM</SelectItem>
                    <SelectItem value="13:00">1:00 PM</SelectItem>
                    <SelectItem value="13:30">1:30 PM</SelectItem>
                    <SelectItem value="18:00">6:00 PM</SelectItem>
                    <SelectItem value="18:30">6:30 PM</SelectItem>
                    <SelectItem value="19:00">7:00 PM</SelectItem>
                    <SelectItem value="19:30">7:30 PM</SelectItem>
                    <SelectItem value="20:00">8:00 PM</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="guests">Number of Guests</Label>
                <Select value={guests} onValueChange={setGuests}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select number of guests" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 person</SelectItem>
                    <SelectItem value="2">2 people</SelectItem>
                    <SelectItem value="3">3 people</SelectItem>
                    <SelectItem value="4">4 people</SelectItem>
                    <SelectItem value="5">5 people</SelectItem>
                    <SelectItem value="6">6 people</SelectItem>
                    <SelectItem value="7">7 people</SelectItem>
                    <SelectItem value="8">8 people</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your full name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email (optional)</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email address"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Your phone number"
                />
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? "Booking..." : "Book Table"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
