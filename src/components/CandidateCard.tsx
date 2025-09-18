import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Mail, Phone, MapPin, Star } from "lucide-react";

interface CandidateCardProps {
  id: string;
  name: string;
  email: string;
  phone: string;
  position: string;
  location: string;
  status: "new" | "screening" | "interview" | "offer" | "hired" | "rejected";
  rating: number;
  avatar?: string;
}

export function CandidateCard({ 
  name, 
  email, 
  phone, 
  position, 
  location, 
  status, 
  rating, 
  avatar 
}: CandidateCardProps) {
  const statusStyle = {
    new: "status-pending",
    screening: "status-warning",
    interview: "bg-blue-100 text-blue-700 border-blue-200",
    offer: "bg-purple-100 text-purple-700 border-purple-200",
    hired: "status-success",
    rejected: "bg-gray-100 text-gray-700 border-gray-200"
  }[status];

  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase();

  return (
    <Card className="card-hover bg-gradient-card">
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          <Avatar className="h-12 w-12">
            <AvatarImage src={avatar} alt={name} />
            <AvatarFallback className="bg-primary/10 text-primary font-medium">
              {initials}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-foreground">{name}</h3>
                <p className="text-sm text-muted-foreground">{position}</p>
              </div>
              <Badge className={statusStyle}>
                {status}
              </Badge>
            </div>
            
            <div className="flex items-center gap-1 mt-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star 
                  key={star}
                  className={`h-3 w-3 ${
                    star <= rating 
                      ? "fill-yellow-400 text-yellow-400" 
                      : "text-gray-300"
                  }`}
                />
              ))}
              <span className="text-xs text-muted-foreground ml-1">({rating}/5)</span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Mail className="h-3 w-3" />
            <span className="truncate">{email}</span>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="h-3 w-3" />
            <span>{phone}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-3 w-3" />
            <span>{location}</span>
          </div>
        </div>

        <div className="flex gap-2 mt-4">
          <Button variant="outline" size="sm" className="flex-1">
            View Profile
          </Button>
          <Button size="sm" className="flex-1 btn-gradient">
            Contact
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}