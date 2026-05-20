import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Calendar, Users, Wallet } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { motion } from 'framer-motion';
import { getDestinationImage } from '@/lib/destinationImages';

export default function TripSummaryHeader({ trip }) {
  const formatDate = (date) => {
    if (!date) return '';
    return format(new Date(date), 'd MMM yyyy', { locale: fr });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="relative rounded-2xl overflow-hidden mb-8"
    >
      <div className="relative h-56 sm:h-72">
        <img
          src={getDestinationImage(trip.destination)}
          alt={trip.destination}
          className="w-full h-full object-cover"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/35 to-transparent" />

        <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
              <h1 className="font-heading text-3xl sm:text-4xl font-bold text-white mb-2">
              {trip.title || trip.destination}
         </h1>
         {trip.title && trip.destination && trip.title !== trip.destination && (
            <p className="text-sm text-white/80 mb-2">
              Destination : {trip.destination}
            </p>
          )}
          {trip.summary && (
            <p className="text-white/85 text-sm sm:text-base max-w-2xl mb-4 line-clamp-2">
              {trip.summary}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-3">
            <Badge className="bg-white/20 backdrop-blur-sm text-white border-white/20 gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              {formatDate(trip.start_date)} — {formatDate(trip.end_date)}
            </Badge>

            <Badge className="bg-white/20 backdrop-blur-sm text-white border-white/20 gap-1.5">
              <Users className="w-3.5 h-3.5" />
              {trip.travelers} voyageur{trip.travelers > 1 ? 's' : ''}
            </Badge>

            <Badge className="bg-accent/90 text-accent-foreground border-accent gap-1.5">
              <Wallet className="w-3.5 h-3.5" />
              {trip.budget}
            </Badge>

            {trip.itinerary && (
              <Badge className="bg-white/20 backdrop-blur-sm text-white border-white/20">
                {trip.itinerary.length} jour{trip.itinerary.length > 1 ? 's' : ''}
              </Badge>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}