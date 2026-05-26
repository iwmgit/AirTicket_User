import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  getMyContact,
  createContact,
  updateContact,
  createBooking,
  addPassengers,
} from "../utils/api";
import Notification from "../components/Notification";

const createEmptyPassenger = () => ({
  givenName: "",
  lastName: "",
  passport: "",
  gender: "",
  dob: "",
  nationality: "",
  phone: "",
});

const EmailIcon = (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M3 8l9 6 9-6" />
    <rect x="3" y="6" width="18" height="12" rx="2" />
  </svg>
);

const PhoneIcon = (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M22 16.92v3a2 2 0 01-2.18 2A19.86 19.86 0 013 5.18 2 2 0 015 3h3a2 2 0 012 1.72c.12.9.33 1.78.63 2.61a2 2 0 01-.45 2.11L9.91 10.91a16 16 0 006.18 6.18l1.47-1.47a2 2 0 012.11-.45c.83.3 1.71.51 2.61.63A2 2 0 0122 16.92z" />
  </svg>
);

const LocationIcon = (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M12 21s-6-5.33-6-10a6 6 0 1112 0c0 4.67-6 10-6 10z" />
    <circle cx="12" cy="11" r="2" />
  </svg>
);

const CalendarIcon = (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const PassportIcon = (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <rect x="4" y="3" width="16" height="18" rx="2" />
    <circle cx="12" cy="10" r="3" />
    <path d="M8 16h8" />
  </svg>
);

const ArrowIcon = (
  <svg className="w-4 h-4 inline mx-2 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const inputBase =
  "w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-800 placeholder-gray-400 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-50 disabled:text-gray-500";

const inputWithIconBase =
  "w-full rounded-lg border border-gray-200 bg-white pl-10 pr-3 py-2.5 text-sm text-gray-800 placeholder-gray-400 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-50 disabled:text-gray-500";

const InputWithIcon = ({ icon, className = "", ...props }) => (
  <div className="relative">
    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
      {icon}
    </span>
    <input {...props} className={`${inputWithIconBase} ${className}`} />
  </div>
);

const formatTime = (iso) => {
  if (!iso) return "--:--";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "--:--";
  return d.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
};

const formatDate = (iso) => {
  if (!iso) return "--";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "--";
  return d.toLocaleDateString([], {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
};

const formatDateForInputDisplay = (dateValue) => {
  if (!dateValue) return "";
  const d = new Date(dateValue);
  if (Number.isNaN(d.getTime())) return "";
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${mm}/${dd}/${yyyy}`;
};

const getFlightDisplayData = (flight) => {
  const snapshot = flight?.flight_snapshot || flight;
  const isRoundTrip = flight?.type === "ROUND_TRIP";
  const segment =
    isRoundTrip && snapshot?.outbound ? snapshot.outbound : snapshot;

  const fromCode =
    segment?.origin ||
    segment?.from ||
    segment?.fromCode ||
    segment?.departure_airport_code ||
    segment?.departure_iata ||
    segment?.origin_code ||
    "RGN";

  const toCode =
    segment?.destination ||
    segment?.to ||
    segment?.toCode ||
    segment?.arrival_airport_code ||
    segment?.arrival_iata ||
    segment?.destination_code ||
    "BKK";

  const fromName =
    segment?.origin_city ||
    segment?.from_city ||
    segment?.departure_city ||
    segment?.origin_name ||
    segment?.fromName ||
    fromCode;

  const toName =
    segment?.destination_city ||
    segment?.to_city ||
    segment?.arrival_city ||
    segment?.destination_name ||
    segment?.toName ||
    toCode;

  return {
    fromName,
    fromCode,
    toName,
    toCode,
    date: formatDate(segment?.departure_time),
    departureTime: formatTime(segment?.departure_time),
    arrivalTime: formatTime(segment?.arrival_time),
  };
};

const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-2xl border border-gray-100 shadow-sm p-6 ${className}`}>
    {children}
  </div>
);

export default function BookingForm({
  selectedFlights = [],
  tripType,
  initialAdults = 1,
}) {
  const navigate = useNavigate();
  const normalizedAdults = Math.max(1, Number(initialAdults) || 1);

  const [contact, setContact] = useState({
    givenName: "",
    lastName: "",
    email: "",
    country: "",
    phone: "",
    id: null,
    createdAt: null,
  });

  const [contactExists, setContactExists] = useState(false);
  const [isLoadingContact, setIsLoadingContact] = useState(true);
  const [error, setError] = useState(null);
  const [isSavingContact, setIsSavingContact] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [passenger, setPassenger] = useState(() =>
    Array.from({ length: normalizedAdults }, createEmptyPassenger)
  );
  const [isConfirming, setIsConfirming] = useState(false);

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const [notification, setNotification] = useState({
    type: "",
    message: "",
  });

  useEffect(() => {
    const fetchContact = async () => {
      try {
        setIsLoadingContact(true);
        const existingContact = await getMyContact();

        setContact({
          givenName: existingContact.given_name,
          lastName: existingContact.last_name,
          email: existingContact.email,
          country: existingContact.country_of_residence,
          phone: existingContact.phone_number,
          id: existingContact.id,
          createdAt: existingContact.created_at,
        });

        setContactExists(true);
      } catch {
        setContactExists(false);
      } finally {
        setIsLoadingContact(false);
      }
    };

    fetchContact();
  }, []);

  const handleContactChange = (e) => {
    setContact({ ...contact, [e.target.name]: e.target.value });
    setError(null);
  };

  const handleCreateContact = async () => {
    try {
      setIsSavingContact(true);
      setError(null);

      await createContact({
        given_name: contact.givenName,
        last_name: contact.lastName,
        email: contact.email,
        country_of_residence: contact.country,
        phone_number: contact.phone,
      });

      setContactExists(true);
      setIsEditMode(false);

      setNotification({
        type: "success",
        message: "Contact created successfully.",
      });
    } catch (err) {
      const message =
        err.response?.data?.message || "Failed to create contact";

      setError(message);
      setNotification({
        type: "error",
        message,
      });
    } finally {
      setIsSavingContact(false);
    }
  };

  const handleUpdateContact = async () => {
    try {
      setIsSavingContact(true);
      setError(null);

      await updateContact({
        given_name: contact.givenName,
        last_name: contact.lastName,
        email: contact.email,
        country_of_residence: contact.country,
        phone_number: contact.phone,
      });

      setIsEditMode(false);

      setNotification({
        type: "success",
        message: "Contact details updated successfully.",
      });
    } catch (err) {
      const message =
        err.response?.data?.message || "Failed to update contact";

      setError(message);
      setNotification({
        type: "error",
        message,
      });
    } finally {
      setIsSavingContact(false);
    }
  };

  const handlePassengerChange = (index, e) => {
    const updated = [...passenger];
    updated[index][e.target.name] = e.target.value;
    setPassenger(updated);
  };

  const handleAddPassenger = () => {
    if (passenger.length >= normalizedAdults) return;
    setPassenger([...passenger, createEmptyPassenger()]);
  };

  const handleConfirm = async () => {
    if (isConfirming) return;

    try {
      setError(null);

      if (!contactExists) {
        setShowConfirmModal(false);
        setError("Please create a contact first");
        setNotification({
          type: "warning",
          message: "Please create a contact first.",
        });
        return;
      }

      if (!passenger.length || !passenger[0].givenName) {
        setShowConfirmModal(false);
        setError("Please add at least one passenger");
        setNotification({
          type: "warning",
          message: "Please add at least one passenger.",
        });
        return;
      }

      setIsConfirming(true);

      const outboundFlight = selectedFlights[0];

      if (!outboundFlight) {
        setShowConfirmModal(false);
        setError("No flight selected");
        setNotification({
          type: "error",
          message: "No flight selected.",
        });
        return;
      }

      const flightSnapshot = outboundFlight.flight_snapshot || outboundFlight;

      const bookingPayload = {
        type:
          outboundFlight.type ||
          (tripType === "round-trip" ? "ROUND_TRIP" : "ONE_WAY"),
        adults: passenger.length,
        bundle_key:
          outboundFlight.bundle_key || outboundFlight.external_flight_id,
        airline_code:
          flightSnapshot.outbound?.airline_code || flightSnapshot.airline_code,
        flight_number:
          flightSnapshot.outbound?.flight_number || flightSnapshot.flight_number,
        flight_snapshot: flightSnapshot,
      };

      console.log("===== CONFIRM BOOKING CLICKED =====");
      console.log("CONTACT INFO:", contact);
      console.log("PASSENGER INFO:", passenger);
      console.log("SELECTED FLIGHTS:", selectedFlights);
      console.log("TRIP TYPE:", tripType);
      console.log("BOOKING PAYLOAD:", bookingPayload);

      const bookingResponse = await createBooking(bookingPayload);

      console.log("BOOKING RESPONSE:", bookingResponse);

      if (!bookingResponse.booking_id) {
        setShowConfirmModal(false);
        setError("Failed to get booking ID");
        setNotification({
          type: "error",
          message: "Failed to get booking ID.",
        });
        return;
      }

      const passengersPayload = {
        passengers: passenger.map((p) => ({
          booking_id: bookingResponse.booking_id,
          given_name: p.givenName,
          last_name: p.lastName,
          passport_number: p.passport,
          gender: p.gender,
          date_of_birth: p.dob,
          nationality: p.nationality,
          phone_number: p.phone,
        })),
      };

      console.log("PASSENGERS PAYLOAD:", passengersPayload);

      await addPassengers(bookingResponse.booking_id, passengersPayload);

      console.log("===== BOOKING SUCCESS =====");
      console.log("FINAL BOOKING ID:", bookingResponse.booking_id);

      setNotification({
        type: "success",
        message: "Booking created successfully.",
      });

      setShowConfirmModal(false);
      setShowSuccessModal(true);
    } catch (err) {
      const message =
        err.response?.data?.message || "Failed to complete booking";

      console.error("BOOKING ERROR:", err?.response?.data || err);

      setShowConfirmModal(false);
      setError(message);
      setNotification({
        type: "error",
        message,
      });
    } finally {
      setIsConfirming(false);
    }
  };

  if (isLoadingContact) {
    return (
      <div className="min-h-screen bg-blue-50 flex items-center justify-center">
        <p className="text-gray-500 text-sm animate-pulse">
          Loading booking information...
        </p>
      </div>
    );
  }

  if (!selectedFlights || selectedFlights.length === 0) {
    return (
      <div className="min-h-screen bg-blue-50 flex items-center justify-center">
        <Notification
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification({ type: "", message: "" })}
        />

        <div className="bg-white rounded-2xl shadow-sm border border-red-100 p-10 text-center">
          <p className="text-red-500 font-medium">No flight selected</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 text-sm text-blue-500 underline"
          >
            Go back and select a flight
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-blue-50 py-10 px-4">
      <Notification
        type={notification.type}
        message={notification.message}
        onClose={() => setNotification({ type: "", message: "" })}
      />

      <div className="max-w-3xl mx-auto space-y-5">
        <div className="flex justify-between items-center mb-2">
          <h1 className="text-2xl font-bold text-gray-900">
            Review & Passenger Info
          </h1>

          <button
            onClick={() => navigate(-1)}
            className="text-sm text-blue-500 hover:text-blue-600 font-medium transition"
          >
            Change Flight
          </button>
        </div>

        <Card>
          <h2 className="text-sm font-semibold text-gray-700 mb-4">
            Your Selected Flight
          </h2>

          <div className="divide-y divide-gray-100">
            {selectedFlights.map((f, i) => {
              const d = getFlightDisplayData(f);

              return (
                <div
                  key={i}
                  className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
                >
                  <p className="text-sm font-medium text-gray-800">
                    {d.fromName} ({d.fromCode})
                    {ArrowIcon}
                    {d.toName} ({d.toCode})
                  </p>

                  <p className="text-xs text-gray-500 whitespace-nowrap ml-4">
                    {d.date}&nbsp;&nbsp;{d.departureTime} – {d.arrivalTime}
                  </p>
                </div>
              );
            })}
          </div>
        </Card>

        <Card>
          <div className="flex justify-between items-center mb-1">
            <h2 className="text-sm font-semibold text-gray-700">
              Contact details
            </h2>

            {contactExists && !isEditMode && (
              <button
                onClick={() => setIsEditMode(true)}
                className="text-xs text-blue-500 hover:underline font-medium"
              >
                Edit
              </button>
            )}

            {isEditMode && (
              <button
                onClick={() => setIsEditMode(false)}
                className="text-xs text-gray-400 hover:underline"
              >
                Cancel
              </button>
            )}
          </div>

          <p className="text-xs text-gray-400 mb-5">
            This is where your confirmation will be sent
          </p>

          {error && (
            <div className="bg-red-50 border border-red-100 text-red-500 text-xs p-3 mb-4 rounded-lg">
              {error}
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-500 block mb-1.5">
                Given names
              </label>
              <input
                name="givenName"
                value={contact.givenName}
                placeholder="Enter given names"
                onChange={handleContactChange}
                disabled={isSavingContact || (contactExists && !isEditMode)}
                className={inputBase}
              />
            </div>

            <div>
              <label className="text-xs text-gray-500 block mb-1.5">
                Last name
              </label>
              <input
                name="lastName"
                value={contact.lastName}
                placeholder="Enter last name"
                onChange={handleContactChange}
                disabled={isSavingContact || (contactExists && !isEditMode)}
                className={inputBase}
              />
            </div>

            <div>
              <label className="text-xs text-gray-500 block mb-1.5">
                Email
              </label>
              <InputWithIcon
                icon={EmailIcon}
                name="email"
                value={contact.email}
                placeholder="Enter email"
                onChange={handleContactChange}
                disabled={isSavingContact || (contactExists && !isEditMode)}
              />
            </div>

            <div>
              <label className="text-xs text-gray-500 block mb-1.5">
                Country / region of residence
              </label>
              <InputWithIcon
                icon={LocationIcon}
                name="country"
                value={contact.country}
                placeholder="Enter Country / region"
                onChange={handleContactChange}
                disabled={isSavingContact || (contactExists && !isEditMode)}
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-xs text-gray-500 block mb-1.5">
                Phone number
              </label>
              <InputWithIcon
                icon={PhoneIcon}
                name="phone"
                value={contact.phone}
                placeholder="+1 (555) 000-0000"
                onChange={handleContactChange}
                disabled={isSavingContact || (contactExists && !isEditMode)}
              />
            </div>
          </div>

          {contactExists && contact.id && (
            <div className="grid md:grid-cols-2 gap-4 mt-5 pt-5 border-t border-gray-100">
              <div>
                <label className="text-xs text-gray-400 block mb-1.5">
                  Contact ID
                </label>
                <input
                  type="text"
                  value={contact.id}
                  disabled
                  className={inputBase}
                />
              </div>

              <div>
                <label className="text-xs text-gray-400 block mb-1.5">
                  Created At
                </label>
                <input
                  type="text"
                  value={
                    contact.createdAt
                      ? new Date(contact.createdAt).toLocaleString()
                      : ""
                  }
                  disabled
                  className={inputBase}
                />
              </div>
            </div>
          )}

          {!contactExists && (
            <button
              onClick={handleCreateContact}
              disabled={isSavingContact}
              className="mt-5 bg-blue-500 hover:bg-blue-600 text-white px-6 py-2.5 text-sm rounded-lg font-medium transition disabled:opacity-50"
            >
              {isSavingContact ? "Saving..." : "Create Contact"}
            </button>
          )}

          {contactExists && isEditMode && (
            <button
              onClick={handleUpdateContact}
              disabled={isSavingContact}
              className="mt-5 bg-blue-500 hover:bg-blue-600 text-white px-6 py-2.5 text-sm rounded-lg font-medium transition disabled:opacity-50"
            >
              {isSavingContact ? "Saving..." : "Save Changes"}
            </button>
          )}
        </Card>

        {passenger.map((p, index) => (
          <Card key={index}>
            <h2 className="text-sm font-semibold text-gray-700 mb-1">
              Passenger {index + 1}
            </h2>

            <p className="text-xs text-gray-400 mb-5">
              Passenger details must match your passport or photo ID
            </p>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-500 block mb-1.5">
                  Given names
                </label>
                <input
                  name="givenName"
                  value={p.givenName}
                  onChange={(e) => handlePassengerChange(index, e)}
                  placeholder="Enter given names"
                  className={inputBase}
                />
              </div>

              <div>
                <label className="text-xs text-gray-500 block mb-1.5">
                  Last name
                </label>
                <input
                  name="lastName"
                  value={p.lastName}
                  onChange={(e) => handlePassengerChange(index, e)}
                  placeholder="Enter last name"
                  className={inputBase}
                />
              </div>

              <div>
                <label className="text-xs text-gray-500 block mb-1.5">
                  Passport Number
                </label>
                <InputWithIcon
                  icon={PassportIcon}
                  name="passport"
                  value={p.passport}
                  onChange={(e) => handlePassengerChange(index, e)}
                  placeholder="Enter Passport Number"
                />
              </div>

              <div>
                <label className="text-xs text-gray-500 block mb-1.5">
                  Gender on ID
                </label>
                <select
                  name="gender"
                  value={p.gender}
                  onChange={(e) => handlePassengerChange(index, e)}
                  className={inputBase}
                >
                  <option value="">Select Gender</option>
                  <option value="MALE">MALE</option>
                  <option value="FEMALE">FEMALE</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-gray-500 block mb-1.5">
                  Date of Birth
                </label>
                <div className="relative">
                  <div className={`${inputWithIconBase} pointer-events-none select-none flex items-center`}>
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                      {CalendarIcon}
                    </span>
                    <span className={p.dob ? "text-gray-800" : "text-gray-400"}>
                      {formatDateForInputDisplay(p.dob) || "MM/DD/YYYY"}
                    </span>
                  </div>
                  <input
                    type="date"
                    value={p.dob}
                    onChange={(e) =>
                      handlePassengerChange(index, {
                        target: { name: "dob", value: e.target.value },
                      })
                    }
                    onClick={(e) => e.currentTarget.showPicker?.()}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-500 block mb-1.5">
                  Nationality
                </label>
                <InputWithIcon
                  icon={LocationIcon}
                  name="nationality"
                  value={p.nationality}
                  onChange={(e) => handlePassengerChange(index, e)}
                  placeholder="Enter Nationality"
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-xs text-gray-500 block mb-1.5">
                  Phone number
                </label>
                <InputWithIcon
                  icon={PhoneIcon}
                  name="phone"
                  value={p.phone}
                  onChange={(e) => handlePassengerChange(index, e)}
                  placeholder="+1 (555) 000-0000"
                />
              </div>
            </div>
          </Card>
        ))}

        <div className="flex justify-between items-center pt-2 pb-8">
          <button
            onClick={() => navigate(-1)}
            className="text-sm text-gray-400 hover:text-gray-600 transition"
          >
            Cancel Booking
          </button>

          <div className="flex gap-3">
            {passenger.length < normalizedAdults && (
              <button
                onClick={handleAddPassenger}
                className="bg-white border border-gray-200 text-gray-700 px-6 py-2.5 text-sm rounded-lg font-medium hover:bg-gray-50 transition shadow-sm"
              >
                Add Passenger
              </button>
            )}

            <button
              onClick={() => setShowConfirmModal(true)}
              disabled={isConfirming}
              className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-2.5 text-sm rounded-lg font-medium transition disabled:opacity-50 shadow-sm"
            >
              Confirm Booking
            </button>
          </div>
        </div>
      </div>

      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              Confirm Booking
            </h2>

            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to confirm this booking? This will create your booking request.
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                disabled={isConfirming}
                className="rounded-md border border-gray-200 px-5 py-2 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-60"
              >
                Cancel
              </button>

              <button
                onClick={handleConfirm}
                disabled={isConfirming}
                className="rounded-md bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
              >
                {isConfirming ? "Confirming..." : "Confirm Booking"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md rounded-lg bg-white p-7 text-center shadow-xl">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-green-600 text-2xl">
              ✓
            </div>

            <h2 className="text-lg font-semibold text-gray-900">
              Booking Successfully
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              Your booking has been created successfully.
            </p>

            <button
              onClick={() => navigate("/profile")}
              className="mt-6 w-full rounded-md bg-blue-600 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}