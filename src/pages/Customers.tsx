
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import PageContainer from "@/components/layout/PageContainer";
import CardGrid from "@/components/layout/CardGrid";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User, UserPlus, Users, Mail, Phone, MapPin } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDate } from "@/lib/formatters";

const translations = {
  en: {
    title: "Customers",
    description: "Manage your customer relationships",
    newCustomer: "New Customer",
    totalCustomers: "Total Customers",
    activeCustomers: "Active Customers",
    recentCustomers: "Recent Customers",
    noCustomers: "No customers found",
    loading: "Loading customers...",
    lastOrder: "Last Order",
    location: "Location",
    contact: "Contact"
  },
  fr: {
    title: "Clients",
    description: "Gérez vos relations clients",
    newCustomer: "Nouveau Client",
    totalCustomers: "Total des Clients",
    activeCustomers: "Clients Actifs",
    recentCustomers: "Clients Récents",
    noCustomers: "Aucun client trouvé",
    loading: "Chargement des clients...",
    lastOrder: "Dernière Commande",
    location: "Emplacement",
    contact: "Contact"
  },
  ar: {
    title: "العملاء",
    description: "إدارة علاقات العملاء",
    newCustomer: "عميل جديد",
    totalCustomers: "إجمالي العملاء",
    activeCustomers: "العملاء النشطون",
    recentCustomers: "العملاء الجدد",
    noCustomers: "لم يتم العثور على عملاء",
    loading: "جاري تحميل العملاء...",
    lastOrder: "آخر طلب",
    location: "الموقع",
    contact: "جهة الاتصال"
  }
};

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  created_at: string;
  last_order_date: string | null;
  avatar_url: string | null;
  is_active: boolean;
}

const Customers = () => {
  const { language } = useLanguage();
  const t = translations[language];
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [activeCustomers, setActiveCustomers] = useState(0);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      setCustomers(data || []);
      setTotalCustomers(data?.length || 0);
      setActiveCustomers(data?.filter(c => c.is_active).length || 0);
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  if (isLoading) {
    return <PageContainer>{t.loading}</PageContainer>;
  }

  return (
    <PageContainer>
      <div className="flex justify-between items-center mb-2">
        <h1 className="text-4xl font-bold">{t.title}</h1>
        <Button>
          <UserPlus className="mr-2 h-4 w-4" />
          {t.newCustomer}
        </Button>
      </div>
      <p className="text-muted-foreground mb-8">{t.description}</p>
      
      <CardGrid columns={2} gap="md">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              {t.totalCustomers}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCustomers}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              {t.activeCustomers}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeCustomers}</div>
          </CardContent>
        </Card>
      </CardGrid>
      
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>{t.recentCustomers}</CardTitle>
          <CardDescription>
            {customers.length} {t.totalCustomers.toLowerCase()}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {customers.length > 0 ? (
            <CardGrid columns={3} gap="md">
              {customers.slice(0, 6).map((customer) => (
                <Card key={customer.id} className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="p-4">
                      <div className="flex items-center gap-3 mb-4">
                        <Avatar>
                          <AvatarImage src={customer.avatar_url || undefined} />
                          <AvatarFallback>{getInitials(customer.name)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-semibold">{customer.name}</h3>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(customer.created_at, language)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                          <span>{customer.email}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                          <span>{customer.phone}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                          <span>{customer.location}</span>
                        </div>
                      </div>
                      
                      {customer.last_order_date && (
                        <div className="mt-4 pt-4 border-t text-sm">
                          <p className="text-muted-foreground">{t.lastOrder}: {formatDate(customer.last_order_date, language)}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </CardGrid>
          ) : (
            <p className="text-muted-foreground text-center">{t.noCustomers}</p>
          )}
        </CardContent>
      </Card>
    </PageContainer>
  );
};

export default Customers;
