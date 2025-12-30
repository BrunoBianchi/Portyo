import { useContext } from "react";
import BioContext from "~/contexts/bio.context";
import { Calendar, Clock, Plus } from "lucide-react";
import type { MetaFunction } from "react-router";

export const meta: MetaFunction = () => {
  return [
    { title: "Scheduler | Portyo" },
    { name: "description", content: "Manage your schedule and appointments." },
  ];
};

export default function DashboardScheduler() {
    const { bio } = useContext(BioContext);

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Scheduler</h1>
                    <p className="text-gray-500 mt-1">Manage your availability and appointments</p>
                </div>
                <button className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-lime-500 text-white rounded-xl font-medium hover:bg-lime-600 transition-colors">
                    <Plus className="w-4 h-4" />
                    New Event Type
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Placeholder for calendar/scheduler content */}
                <div className="md:col-span-2 bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-full bg-lime-100 flex items-center justify-center text-lime-600">
                            <Calendar className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="font-semibold text-gray-900">Upcoming Events</h2>
                            <p className="text-sm text-gray-500">Your scheduled appointments</p>
                        </div>
                    </div>
                    
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                            <Calendar className="w-8 h-8 text-gray-300" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-1">No events scheduled</h3>
                        <p className="text-gray-500 max-w-sm">
                            Share your booking link to start receiving appointments.
                        </p>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                <Clock className="w-4 h-4" />
                            </div>
                            <h3 className="font-semibold text-gray-900">Availability</h3>
                        </div>
                        <p className="text-sm text-gray-500 mb-4">
                            Set your weekly hours when you are available for bookings.
                        </p>
                        <button className="w-full py-2 px-4 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                            Edit Availability
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
