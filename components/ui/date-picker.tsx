"use client"

import * as React from "react"
import {
  format,
  getMonth,
  getYear,
  setMonth,
  setYear,
  addDays,
  addWeeks,
  addMonths,
  addYears,
  isBefore,
  isAfter,
  isSameDay,
} from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface DatePickerProps {
  startYear?: number
  endYear?: number
}

const weekdays = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
]

export function DatePicker({
  startYear = getYear(new Date()) - 100,
  endYear = getYear(new Date()) + 100,
}: DatePickerProps) {
  const [startDate, setStartDate] = React.useState<Date>(new Date())
  const [endDate, setEndDate] = React.useState<Date | undefined>(undefined)
  const [recurrence, setRecurrence] = React.useState<"daily" | "weekly" | "monthly" | "yearly">("daily")
  const [interval, setInterval] = React.useState<number>(1)
  const [selectedWeekdays, setSelectedWeekdays] = React.useState<string[]>([])

  const months = [...Array(12)].map((_, i) => format(setMonth(new Date(), i), "MMMM"))
  const years = Array.from({ length: endYear - startYear + 1 }, (_, i) => startYear + i)

  const handleRecurringDateGeneration = (): Date[] => {
    if (!startDate) return []

    const result: Date[] = []
    let current = startDate
    const until = endDate || addMonths(startDate, 6)

    const adder = {
      daily: addDays,
      weekly: addWeeks,
      monthly: addMonths,
      yearly: addYears,
    }[recurrence]

    while (!isAfter(current, until)) {
      if (recurrence === "weekly" && selectedWeekdays.length > 0) {
        selectedWeekdays.forEach((day) => {
          const weekdayIndex = weekdays.indexOf(day)
          const candidate = new Date(current)
          candidate.setDate(candidate.getDate() + ((7 + weekdayIndex - candidate.getDay()) % 7))
          if (!isAfter(candidate, until) && !result.find((d) => isSameDay(d, candidate))) {
            result.push(candidate)
          }
        })
        current = adder(current, interval)
      } else {
        result.push(current)
        current = adder(current, interval)
      }
    }

    return result
  }

  const recurringDates = handleRecurringDateGeneration()

  return (
    <div className="space-y-4">
      {/* Start Date Picker */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-[250px] justify-start text-left font-normal">
            <CalendarIcon className="mr-2 h-4 w-4" />
            {startDate ? format(startDate, "PPP") : <span>Pick a date</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-4 space-y-2">
          {/* Month & Year Selector */}
          <div className="flex gap-2">
            <Select
              onValueChange={(month) => setStartDate(setMonth(startDate, months.indexOf(month)))}
              value={months[getMonth(startDate)]}
            >
              <SelectTrigger className="w-[110px]">
                <SelectValue placeholder="Month" />
              </SelectTrigger>
              <SelectContent>
                {months.map((month) => (
                  <SelectItem key={month} value={month}>
                    {month}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              onValueChange={(year) => setStartDate(setYear(startDate, parseInt(year)))}
              value={getYear(startDate).toString()}
            >
              <SelectTrigger className="w-[110px]">
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent>
                {years.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Start Date Calendar */}
          <Calendar
            mode="single"
            selected={startDate}
            onSelect={setStartDate}
            initialFocus
            month={startDate}
            onMonthChange={setStartDate}
          />

          {/* Optional End Date */}
          <label className="text-sm font-medium block">End Date (Optional)</label>
          <Calendar
            mode="single"
            selected={endDate}
            onSelect={setEndDate}
            initialFocus
            month={endDate || startDate}
            onMonthChange={(date) => setEndDate(date)}
          />
        </PopoverContent>
      </Popover>

      {/* Recurrence Options */}
      <div className="flex gap-2">
        <Select value={recurrence} onValueChange={(value) => setRecurrence(value as any)}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Recurrence" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="daily">Daily</SelectItem>
            <SelectItem value="weekly">Weekly</SelectItem>
            <SelectItem value="monthly">Monthly</SelectItem>
            <SelectItem value="yearly">Yearly</SelectItem>
          </SelectContent>
        </Select>
        <input
          type="number"
          min={1}
          value={interval}
          onChange={(e) => setInterval(Number(e.target.value))}
          className="border rounded-md px-2 py-1 w-[100px] text-sm"
          placeholder="Every X"
        />
      </div>

      {/* Weekday Selector */}
      {recurrence === "weekly" && (
        <div className="flex gap-2 flex-wrap">
          {weekdays.map((day) => (
            <label key={day} className="flex items-center gap-1 text-sm">
              <input
                type="checkbox"
                checked={selectedWeekdays.includes(day)}
                onChange={() =>
                  setSelectedWeekdays((prev) =>
                    prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
                  )
                }
              />
              {day.slice(0, 3)}
            </label>
          ))}
        </div>
      )}

      {/* Preview of Recurring Dates */}
      <div className="mt-4">
        <label className="text-sm font-semibold mb-2 block">Recurring Dates Preview:</label>
        <Calendar
          mode="multiple"
          selected={recurringDates}
          month={startDate}
          showOutsideDays
          className="border rounded-md"
        />
      </div>
    </div>
  )
}
