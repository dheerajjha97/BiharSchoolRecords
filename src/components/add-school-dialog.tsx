
"use client";

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { School } from '@/lib/school';
import { Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Info } from 'lucide-react';

interface AddSchoolDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  udise: string; // From login form input
  onSave: (school: School) => Promise<void>;
}

export function AddSchoolDialog({ open, onOpenChange, udise, onSave }: AddSchoolDialogProps) {
  const [schoolName, setSchoolName] = useState('');
  const [schoolAddress, setSchoolAddress] = useState('');
  const [schoolUdise, setSchoolUdise] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  
  const finalUdise = udise || schoolUdise;
  const canSave = finalUdise.length === 11 && schoolName.trim() && schoolAddress.trim();

  useEffect(() => {
    if (open) {
      setSchoolUdise(udise);
      setSchoolName('');
      setSchoolAddress('');
      setIsSaving(false);
    }
  }, [open, udise]);

  const handleSave = async () => {
    if (!canSave) return;
    
    setIsSaving(true);
    try {
        await onSave({
            udise: finalUdise,
            name: schoolName.trim(),
            address: schoolAddress.trim(),
        });
        onOpenChange(false);
    } catch (error) {
        console.error("Save failed from dialog:", error);
    } finally {
        setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Register New School</DialogTitle>
          <DialogDescription>
            Enter your school's details. After this step, you will be prompted to sign in with Google to link an account for management.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="udise-code">UDISE Code</Label>
            <Input 
              id="udise-code" 
              value={finalUdise} 
              onChange={(e) => setSchoolUdise(e.target.value.replace(/\D/g, ''))} 
              maxLength={11} 
              placeholder="Enter 11-digit UDISE code" 
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="school-name">School Name</Label>
            <Input id="school-name" value={schoolName} onChange={(e) => setSchoolName(e.target.value)} placeholder="Enter official school name" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="school-address">Address</Label>
            <Input id="school-address" value={schoolAddress} onChange={(e) => setSchoolAddress(e.target.value)} placeholder="Enter full school address" />
          </div>
          <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>Next Step: Link Google Account</AlertTitle>
              <AlertDescription>
                After clicking 'Continue', you'll be asked to sign in with Google. This will securely link your Google Account to this school for future logins.
              </AlertDescription>
          </Alert>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>Cancel</Button>
          <Button onClick={handleSave} disabled={!canSave || isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Continue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
