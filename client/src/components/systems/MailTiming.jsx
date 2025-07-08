import React from 'react';

const MailTiming = () => {
  const handleMailTimingChange = async (e) => {
    e.preventDefault();
    const time = e.target.elements.time.value;
    try {
      const res = await fetch('/api/mail/timechange', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          time,
        }),
      });
      if (res.ok) {
        console.log('Time updated successfully');
      } else {
        console.log('Error updating the time');
      }
    } catch (err) {
      console.log('Error sending the mail');
    }
  };

  return (
    <div className="flex flex-col mt-4 border-slate-700 items-center min-h-screen bg-gray-50">
      <div className="bg-white shadow-lg rounded-lg p-6 md:p-10 w-full max-w-md">
        <h1 className="text-xl md:text-2xl font-semibold text-center text-gray-800">
          Set Email Dispatch Time
        </h1>
        <p className="text-sm text-gray-600 text-center mt-2">
          Specify the time when collective emails should be sent to staff members.
        </p>

        <form onSubmit={handleMailTimingChange} className="mt-6">
          <div className="flex flex-col">
            <label htmlFor="time" className="text-sm font-medium text-gray-700 mb-2">
              Select Time
            </label>
            <input
              type="time"
              name="time"
              id="time"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <button
            type="submit"
            className="mt-4 w-full bg-green-600 text-white font-medium py-2 px-4 rounded-lg shadow hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition"
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  );
};

export default MailTiming;
