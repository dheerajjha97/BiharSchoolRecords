
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/context/AuthContext';
import { saveSchool, getSchoolByEmail } from '@/lib/school';
import { useToast } from '@/hooks/use-toast';
import { clearSchoolData } from '@/ai/flows/clear-school-data-flow';
import { GoogleAuthProvider, signInWithPopup, linkWithPopup, unlink } from 'firebase/auth';
import { auth } from '@/lib/firebase';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Loader2, AlertTriangle, Trash2, UserCog, CheckCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';

const profileSchema = z.object({
  name: z.string().min(1, 'School name is required.'),
  address: z.string().min(1, 'School address is required.'),
  mobile: z.string().regex(/^\d{10}$/, "Please enter a valid 10-digit mobile number.").optional().or(z.literal('')),
});

type ProfileFormValues = z.infer<typeof profileSchema>;


function AccountManager() {
  const { school, user, login } = useAuth();
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  if (!school || !user) return null;

  const handleLinkAccount = async () => {
    setLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      // Check if another school is already linked to this Google account
      const result = await signInWithPopup(auth, provider);
      const newEmail = result.user.email;
      if (!newEmail) throw new Error("Could not get email from Google Account.");
      
      const existingSchool = await getSchoolByEmail(newEmail);
      if (existingSchool && existingSchool.udise !== school.udise) {
        toast({
          title: "Account Already Linked",
          description: `This Google account (${newEmail}) is already linked to another school (${existingSchool.name}). Please use a different Google account.`,
          variant: "destructive",
        });
        return;
      }
      
      const updatedSchoolData = { ...school, email: newEmail };
      await saveSchool(updatedSchoolData);
      await login(updatedSchoolData, user); // Re-login to update context

      toast({
        title: "Account Linked!",
        description: `Successfully linked ${newEmail} to this school.`,
      });

    } catch (error) {
      console.error("Error linking account:", error);
      let desc = "An unexpected error occurred.";
      if (error instanceof Error) desc = error.message;
      toast({ title: "Linking Failed", description: desc, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleUnlinkAccount = async () => {
     if (!school) return;
     setLoading(true);
     try {
        const updatedSchoolData = { ...school, email: undefined };
        await saveSchool(updatedSchoolData);
        await login(updatedSchoolData, user); // Re-login to update context
        toast({
            title: "Account Unlinked",
            description: "The Google account has been unlinked from this school.",
        });
     } catch(e) {
        console.error("Error unlinking account:", e);
        let desc = "An unexpected error occurred.";
        if (e instanceof Error) desc = e.message;
        toast({ title: "Unlinking Failed", description: desc, variant: "destructive" });
     } finally {
        setLoading(false);
     }
  }


  return (
     <Card>
        <CardHeader>
            <CardTitle className="flex items-center gap-2"><UserCog /> Account Manager</CardTitle>
            <CardDescription>Link a Google Account to manage this school. This will be used for all future logins.</CardDescription>
        </CardHeader>
        <CardContent>
            {school.email ? (
                 <div className="flex flex-col sm:flex-row items-center justify-between rounded-lg border bg-secondary/30 p-4">
                    <div className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <div>
                            <p className="font-semibold">Linked Account:</p>
                            <p className="text-sm text-muted-foreground">{school.email}</p>
                        </div>
                    </div>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="outline" className="mt-2 sm:mt-0" disabled={loading}>
                                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                Change Account
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Change Linked Account?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This will unlink the current Google account ({school.email}). You will be prompted to sign in with a new Google account to link.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={handleLinkAccount}>Continue</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            ) : (
                <div className="flex flex-col sm:flex-row items-center justify-between rounded-lg border border-dashed border-primary/50 p-4">
                    <div>
                        <h3 className="font-semibold">No Google Account Linked</h3>
                        <p className="text-sm text-muted-foreground">
                            Link a Google account for secure and easy access.
                        </p>
                    </div>
                    <Button onClick={handleLinkAccount} disabled={loading} className="mt-2 sm:mt-0">
                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Link Google Account
                    </Button>
                </div>
            )}
        </CardContent>
     </Card>
  )
}


function DangerZone() {
  const { school, logout } = useAuth();
  const { toast } = useToast();
  const [isClearing, setIsClearing] = useState(false);
  const [confirmationUdise, setConfirmationUdise] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleClearData = async () => {
    if (!school || confirmationUdise !== school.udise) {
      toast({
        title: 'Error',
        description: 'UDISE code does not match. Action cancelled.',
        variant: 'destructive',
      });
      return;
    }

    setIsClearing(true);
    try {
      const result = await clearSchoolData({ udise: school.udise });
      toast({
        title: 'Data Cleared Successfully!',
        description: `${result.deletedCount} admission records have been permanently deleted.`,
      });
      window.location.href = '/dashboard';

    } catch (error) {
      let errorMessage = 'An unexpected error occurred while clearing data.';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      toast({
        title: 'Data Clearing Failed',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsClearing(false);
      setConfirmationUdise('');
      setIsDialogOpen(false);
    }
  };
  
  if (!school) return null;

  return (
    <Card className="max-w-2xl border-destructive">
      <CardHeader>
        <div className="flex items-center gap-2">
          <AlertTriangle className="text-destructive h-6 w-6" />
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
        </div>
        <CardDescription>
          These actions are irreversible. Please proceed with caution.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row items-center justify-between rounded-lg border border-dashed border-destructive/50 p-4">
          <div>
            <h3 className="font-semibold">Clear All School Data</h3>
            <p className="text-sm text-muted-foreground">
              This will permanently delete all pending, approved, and rejected admissions for your school.
            </p>
          </div>
          <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="mt-2 sm:mt-0 sm:ml-4 flex-shrink-0">
                <Trash2 className="mr-2 h-4 w-4" />
                Clear Data
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete all admission data for your school ({school.name}).
                  To confirm, please type your school's UDISE code: <strong className="font-mono">{school.udise}</strong>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <div className="py-2">
                <Label htmlFor="confirm-udise">UDISE Code</Label>
                <Input
                  id="confirm-udise"
                  value={confirmationUdise}
                  onChange={(e) => setConfirmationUdise(e.target.value)}
                  placeholder="Type UDISE code to confirm"
                  className="font-mono"
                  autoComplete='off'
                />
              </div>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setConfirmationUdise('')} disabled={isClearing}>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleClearData}
                  disabled={isClearing || confirmationUdise !== school.udise}
                  className="bg-destructive hover:bg-destructive/90"
                >
                  {isClearing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  I understand, delete all data
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  );
}


export default function ProfilePage() {
  const { school, loading: authLoading, user, login } = useAuth();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: '',
      address: '',
      mobile: '',
    },
  });

  useEffect(() => {
    if (school) {
      const displayMobile = school.mobile?.startsWith('+91') 
        ? school.mobile.substring(3) 
        : school.mobile;

      form.reset({
        name: school.name,
        address: school.address,
        mobile: displayMobile || '',
      });
    }
  }, [school, form]);

  const onSubmit = async (data: ProfileFormValues) => {
    if (!school || !user) {
      toast({ title: 'Error', description: 'No school or user is currently logged in.', variant: 'destructive'});
      return;
    }

    setIsSaving(true);
    try {
      const mobileWithCode = data.mobile ? `+91${data.mobile}` : undefined;
      
      const updatedSchoolData = { 
        ...school, 
        name: data.name,
        address: data.address,
        mobile: mobileWithCode,
      };
      await saveSchool(updatedSchoolData);
      
      await login(updatedSchoolData, user);

      toast({
        title: 'Success!',
        description: 'Your school profile has been updated.',
      });
    } catch (error) {
      let errorMessage = 'An unexpected error occurred.';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      toast({
        title: 'Update Failed',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  if (authLoading) {
    return (
        <div className="flex flex-col gap-8">
            <header>
                <Skeleton className="h-10 w-1/3" />
                <Skeleton className="h-4 w-2/3 mt-2" />
            </header>
            <Card className="max-w-2xl">
                <CardHeader>
                    <Skeleton className="h-8 w-1/4" />
                    <Skeleton className="h-4 w-3/4 mt-2" />
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                    <div className="space-y-2"><Skeleton className="h-4 w-1/4" /><Skeleton className="h-10 w-full" /></div>
                    <div className="space-y-2"><Skeleton className="h-4 w-1/4" /><Skeleton className="h-10 w-full" /></div>
                    <div className="space-y-2"><Skeleton className="h-4 w-1/4" /><Skeleton className="h-10 w-full" /></div>
                    <Skeleton className="h-10 w-32" />
                </CardContent>
            </Card>
        </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">School Profile</h1>
        <p className="text-muted-foreground mt-1">
          Update your school's details and manage account access.
        </p>
      </header>

      <div className="max-w-2xl space-y-8">
        <AccountManager />
        
        <Card>
            <CardHeader>
            <CardTitle>Edit Details</CardTitle>
            <CardDescription>
                Changes made here will be reflected across the application.
            </CardDescription>
            </CardHeader>
            <CardContent>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>School Name</FormLabel>
                        <FormControl>
                        <Input placeholder="Your school's official name" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>School Address</FormLabel>
                        <FormControl>
                        <Input placeholder="Your school's full address" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="mobile"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>School Mobile Number (Optional)</FormLabel>
                        <FormControl>
                        <div className="relative">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <span className="text-muted-foreground sm:text-sm">+91</span>
                            </div>
                            <Input type="tel" maxLength={10} placeholder="10-digit mobile number" className="pl-12" {...field} />
                        </div>
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <Button type="submit" disabled={isSaving}>
                    {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Changes
                </Button>
                </form>
            </Form>
            </CardContent>
        </Card>
        
        <DangerZone />
      </div>
    </div>
  );
}
